FlowRoute = function(path, options) {
  options = options || {};

  this.path = path;
  this.render = options.render || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._subsMap = {};
}


FlowRoute.prototype.subscribe = function(name, sub, options) {
  this._subsMap[name] = sub;
}


FlowRoute.prototype.subscription = function(name) {
  return this._subsMap[name];
}


FlowRoute.prototype.middleware = function(middleware) {
  page(this.path, function (ctx, next) {
    middleware(ctx.pathname, next);
  });
  return this;
}
