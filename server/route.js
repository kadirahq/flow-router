Route = function(router, path, options) {
  var self = this;
  options = options || {};

  this.path = path;
  this.action = options.action || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._subsMap = {};

  Picker.route(path, function(params, req, res, next) {
    // a check to see if this is a html page or a static assets like js, css
    // we don't need to do SSR for them
    // not sure, google bot do this, still a good idea to do this
    var isHtmlPage = /html/.test(req.headers['accept']);
    if(!isHtmlPage) {
      return next();
    }

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
          var reactRoot = "<div id='react-root'>" + ssrContext.getHtml() + "</div>";
          data = data.replace('<body>', '<body>' + reactRoot);
        }
        originalWrite.call(this, data);
      };
      next();
    });
  });
};

Route.prototype.register = function(name, sub, options) {
  this._subsMap[name] = sub;
};


Route.prototype.subscription = function(name) {
  return this._subsMap[name];
};


Route.prototype.middleware = function(middleware) {

};
