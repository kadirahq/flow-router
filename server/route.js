var Url = Npm.require('url');

Route = function(router, path, options) {
  var self = this;
  options = options || {};
  this.options = options;

  this.path = path;
  this.name = options.name;
  this.action = options.action || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._subsMap = {};
  this._cache = {};

  Picker.middleware(Npm.require('connect').cookieParser());
  Picker.route(path, function(params, req, res, next) {

    if(!self.isHtmlPage(req.url)) {
      return next();
    }

    var cachedPage = self._lookupCachedPage(req.url);
    if(cachedPage) {
      return processFromCache(cachedPage);
    }

    FastRender.handleRoute(processFromSsr, params, req, res, function(data) {
      next();
    });

    function processFromSsr() {
      var ssrContext = new SsrContext();
      router.ssrContext.withValue(ssrContext, function() {
        var context = self._buildContext(req.url, params);
        router.currentRoute.withValue(context, function () {
          try {
            if(options.subscriptions) {
              options.subscriptions.call(self, params);
            }

            if(options.action) {
              options.action.call(self, params);
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

            var reactRoot = "<div id='react-root'>" + ssrContext.getHtml() + "</div>";
            data = data.replace('<body>', '<body>' + reactRoot);
          }
          originalWrite.call(this, data);

          var pageInfo = {
            frData: res.getData("fast-render-data"),
            head: head,
            body: reactRoot
          };

          // cache the page if mentioned a timeout
          if(router.pageCacheTimeout) {
            self._cachePage(req.url, pageInfo, router.pageCacheTimeout);
          }
        };
      });
    }

    function processFromCache(page) {
      var originalWrite = res.write;
      res.write = function(data) {
        data = data.replace('</head>', page.head + '\n</head>');
        data = data.replace('<body>', '<body>' + page.body);
        originalWrite.call(this, data);
      }

      res.pushData('fast-render-data', page.frData);
      next();
    }
  });
};

Route.prototype._buildContext = function(url, params) {
  var context = {
    route: this,
    path: url,
    params: params,
    queryParams: params.query
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
