Route = function(router, path, options) {
  var self = this;
  options = options || {};

  this.path = path;
  this.action = options.action || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._subsMap = {};
  this._states = {};
  this._router = router;
  this._middleware = [];
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
  var mw = this._router._createCallback(this.path, function (ctx, next) {
    middlewareFn(ctx.pathname, next);
  });

  this._middleware.push(mw);
  this._router._updateCallbacks();
  return this;
};
