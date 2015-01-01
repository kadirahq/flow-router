Route = function(router, path, options) {
  options = options || {};

  this.path = path;
  this.action = options.action || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
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


Route.prototype.middleware = function(middlewareFn) {
  this._router._page(this.path, function (ctx, next) {
    middlewareFn(ctx.pathname, next);
  });

  return this;
};
