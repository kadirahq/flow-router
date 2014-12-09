FlowRouter = {
  _routeMap: {},
  _clientRouter: ClientRouter,
  _routeStates: new ReactiveDict,
};

// add new route
FlowRouter.route = function (path, options) {
  this._routeMap[path] = options;
  this._clientRouter.addRoute(path, options);
}

FlowRouter.setState = function (name, value) {
  this._routeStates.set(name, value);
  this._clientRouter.setState(name, value)
}

FlowRouter.getState = function (name) {
  return this._routeStates.get(name);
}
