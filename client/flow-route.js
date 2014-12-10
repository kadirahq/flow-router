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


FlowRoute.prototype.subscribe = function (name, sub, options) {
  options = _.extend(this._getDefaultSubOptions(), options);
  if(options.client) {
    this._subsMap[name] = sub;
  }
};


FlowRoute.prototype.setState = function (name, value, options) {
  this._states.set(name, value);
  this._clientRouter.setState(name, value, options)
};


FlowRoute.prototype.getState = function (name) {
  this._states.get(name);
};


FlowRoute.prototype._getDefaultSubOptions = function() {
  return {
    server: true,
    client: true,
  }
}
