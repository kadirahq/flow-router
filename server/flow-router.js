FlowRouter = {
  _routeMap: {},
};

// add new route
FlowRouter.route = function (path, options) {
  this._routeMap[path] = options;
}
