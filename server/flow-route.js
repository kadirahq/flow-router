FlowRoute = function (path, options) {
  this.path = path;
  this.render = options.render || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._middleware = [];
  this._states = new ReactiveDict;
};

FlowRoute.prototype.middleware = function (middleware) {
  this._middleware.push(middleware);
};
