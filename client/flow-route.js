FlowRoute = function (path, options) {
  this.path = path;
  this.render = options.render || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._states = new ReactiveDict;
  this._clientRouter.route(path, options);
};


FlowRoute.prototype._clientRouter = ClientRouter;


FlowRoute.prototype.setState = function (name, value, options) {
  this._states.set(name, value);
  this._clientRouter.setState(name, value, options)
};


FlowRoute.prototype.getState = function (name) {
  this._states.get(name);
};
