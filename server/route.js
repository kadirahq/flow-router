var Url = Npm.require('url');
var Cheerio = Npm.require('cheerio');

Route = function(router, pathDef, options) {
  var self = this;
  options = options || {};
  this.options = options;
  this.name = options.name;
  this.pathDef = pathDef;

  // Route.path is deprecated and will be removed in 3.0
  this.path = pathDef;

  this.action = options.action || Function.prototype;
  this._router = router;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._subsMap = {};
  this._cache = {};

  Picker.middleware(Npm.require('connect').cookieParser());
  // process null subscriptions with FR support
  Picker.middleware(FastRender.handleOnAllRoutes);
  Picker.route(pathDef, function(params, req, res, next) {

    if(!self.isHtmlPage(req.url)) {
      return next();
    }

    var cachedPage = self._lookupCachedPage(req.url);
    if(cachedPage) {
      return self._processFromCache(cachedPage, res, next);
    }

    var processFromSsr = self._processFromSsr.bind(self, params, req, res);
    FastRender.handleRoute(processFromSsr, params, req, res, function(data) {
      next();
    }); 
  });
};

Route.prototype._processFromSsr = function (params, req, res) {
  var self = this;
  var ssrContext = new SsrContext();
  self._router.ssrContext.withValue(ssrContext, function() {
    var queryParams = params.query;
    // We need to remove `.query` since it's not part of our params API
    // But we only need to remove it in our copy. 
    // We should not trigger any side effects
    params = _.clone(params);
    delete params.query;
    var context = self._buildContext(req.url, params, queryParams);

    self._router.currentRoute.withValue(context, function () {
      try {
        // get the data for null subscriptions and add them to the
        // ssrContext
        var frData = res.getData("fast-render-data");
        if(frData) {
          ssrContext.addData(frData.collectionData);
        }

        if(self.options.subscriptions) {
          self.options.subscriptions.call(self, params, queryParams);
        }

        if(self.options.action) {
          self.options.action.call(self, params, queryParams);
        }
      } catch(ex) {
        console.error("Error when doing SSR. path:", req.url, " ", ex.message);
        console.error(ex.stack);
      }
    });

    var originalWrite = res.write;
    res.write = function(data) {
      if(typeof data === 'string') {
        var head = ssrContext.getHead();
        if(head && head.trim() !== "") {
          data = data.replace('</head>', head + '\n</head>');
        }

        var reactRoot = ssrContext.getHtml();
        if (self._router.deferScriptLoading) {
          data = moveScripts(data);
        }
        data = data.replace('<body>', '<body>' + reactRoot);

        var pageInfo = {
          frData: res.getData("fast-render-data"),
          html: data
        };

        // cache the page if mentioned a timeout
        if(self._router.pageCacheTimeout) {
          self._cachePage(req.url, pageInfo, self._router.pageCacheTimeout);
        }
      }
      
      originalWrite.call(this, data);
    };
  });

  function moveScripts(data) {
    var $ = Cheerio.load(data, {
      decodeEntities: false
    });
    var heads = $('head script');
    $('body').append(heads);

    // Remove empty lines caused by removing scripts
    $('head').html($('head').html().replace(/(^[ \t]*\n)/gm, ''));

    return $.html();
  }
};

Route.prototype._processFromCache = function(pageInfo, res, next) {
  var originalWrite = res.write;
  res.write = function(data) {
    originalWrite.call(this, pageInfo.html);
  }

  res.pushData('fast-render-data', pageInfo.frData);
  next();
};

Route.prototype._buildContext = function(url, params, queryParams) {
  var context = {
    route: this,
    path: url,
    params: params,
    queryParams: queryParams
  };

  return context;
};

Route.prototype.isHtmlPage = function(url) {
  var pathname = Url.parse(url).pathname;
  var ext = pathname.split('.').slice(1).join('.');

  // if there is no extention, yes that's a html page
  if(!ext) {
    return true;
  }

  // if this is htm or html, yes that's a html page
  if(/^htm/.test(ext)) {
    return true;
  }

  // if not we assume this is not as a html page
  // this doesn't do any harm. But no SSR
  return false;
};

Route.prototype._lookupCachedPage= function(url) {
  var info = this._cache[url];
  if(info) {
    return info.data;
  }
};

Route.prototype._cachePage = function(url, data, timeout) {
  var self = this;
  var existingInfo = this._cache[url];
  if(existingInfo) {
    clearTimeout(existingInfo.timeoutHandle);
  }

  var info = {
    data: data,
    timeoutHandle: setTimeout(function() {
      delete self._cache[url];
    }, timeout)
  };

  this._cache[url] = info;
};

Route.prototype.register = function(name, sub, options) {
  this._subsMap[name] = sub;
};

Route.prototype.subscription = function(name) {
  return this._subsMap[name];
};

Route.prototype.middleware = function(middleware) {

};
