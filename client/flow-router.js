FlowRouter = {
  _routeMap: {},
  _clientRouter: ClientRouter,
};

// add new route
FlowRouter.route = function (path, options) {
  this._routeMap[path] = options;
  this._clientRouter.addRoute(path, options);
}
