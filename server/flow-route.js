FlowRoute = function (path, options) {
  this.path = path;
  this.render = options.render || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._middleware = [];
};


FlowRoute.prototype.middleware = function (middleware) {
  this._middleware.push(middleware);
};


FlowRoute.prototype.subscribe = function () {
  this.subscriptions();
};
