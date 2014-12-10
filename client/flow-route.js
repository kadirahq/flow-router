FlowRoute = function (path, options) {
  this.path = path;
  this.render = options.render || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._middleware = [];
  this._states = new ReactiveDict;
  this._clientRouter.route(path, options);
};


FlowRoute.prototype._clientRouter = ClientRouter;


FlowRoute.prototype.middleware = function (middleware) {
  this._middleware.push(middleware);
  this._clientRouter.middleware(middleware, {
    path: this.path,
  });
};


FlowRoute.prototype.subscribe = function (middleware) {
  this.subscriptions();
};


FlowRoute.prototype.setState = function (name, value, options) {
  this._states.set(name, value);
  this._clientRouter.setState(name, value, options)
};


FlowRoute.prototype.getState = function (name) {
  this._states.get(name);
};
