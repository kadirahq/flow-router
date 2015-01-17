Route = function(router, path, options) {
  options = options || {};

  this.path = path;
  this._action = options.action || Function.prototype;
  this._subscriptions = options.subscriptions || Function.prototype;
  this._middlewares = options.middlewares || [];
  this._subsMap = {};
  this._states = {};
  this._router = router;
};


Route.prototype.subscribe = function(name, sub, options) {
  this._subsMap[name] = sub;
};


Route.prototype.getSubscription = function(name) {
  return this._subsMap[name];
};


Route.prototype.getAllSubscriptions = function() {
  return this._subsMap;
};


Route.prototype._processMiddlewares = function(context, after) {
  var currentIndex = 0;
  var self = this;

  runMiddleware();
  function runMiddleware() {
    var fn = self._middlewares[currentIndex++];
    if(fn) {
      fn(context.path, function(redirectPath) {
        if(redirectPath) {
          return self._router.redirect(redirectPath);
        } else {
          runMiddleware();
        }
      });
    } else {
      after();
    }
  }
};

Route.prototype.callAction = function(context) {
  var self = this;
  self._processMiddlewares(context, function() {
    self._action(context.params);
  });
};

Route.prototype.callSubscriptions = function(context) {
  this._subscriptions(context.params);
};