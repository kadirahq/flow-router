var Url = Npm.require('url');

Route = function(router, path, options) {
  var self = this;
  options = options || {};

  this.path = path;
  this.action = options.action || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._subsMap = {};

  Picker.middleware(Npm.require('connect').cookieParser());
  Picker.route(path, function(params, req, res, next) {
    
    if(!self.isHtmlPage(req.url)) {
      return next();
    }

    FastRender.handleRoute(processSsr, params, req, res, next)

    function processSsr() {
      var ssrContext = new SsrContext();
      router.ssrContext.withValue(ssrContext, function() {
        var context = {path: req.url, params: params};
        router.currentRoute.withValue(context, function () {
          try {
            if(options.subscriptions) {
              options.subscriptions.call(self, params);
            }

            if(options.action) {
              options.action.call(null, params);
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
        };
      });
    }

  });
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

Route.prototype.register = function(name, sub, options) {
  this._subsMap[name] = sub;
};

Route.prototype.subscription = function(name) {
  return this._subsMap[name];
};

Route.prototype.middleware = function(middleware) {

};