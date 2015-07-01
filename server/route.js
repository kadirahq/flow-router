Route = function(router, path, options) {
  options = options || {};

  this.path = path;
  this.action = options.action || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._subsMap = {};

  Picker.route(path, function(params, req, res, next) {
    var ssrContext = new SsrContext();
    router.ssrContext.withValue(ssrContext, function() {
      if(options.action) {
        var context = {params: params};
        options.action.call(null, context);
      }

      var originalWrite = res.write;
      res.write = function(data) {
        if(typeof data === 'string') {
          data = data.replace('<body>', '<body>' + ssrContext.getHtml());
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
