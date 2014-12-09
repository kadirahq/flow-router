FlowRouter = {
  _routeMap: {},
  _FlowRoute: FlowRoute,
};

// add new route
FlowRouter.route = function (path, options) {
  var route = new this._FlowRoute(path, options);
  this._routeMap[path] = route;
}
