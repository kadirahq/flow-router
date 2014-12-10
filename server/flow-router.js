FlowRouter = {
  _routeMap: {},
  _middleware: [],
  _FlowRoute: FlowRoute,
};


FlowRouter.route = function (path, options) {
  var route = new this._FlowRoute(path, options);
  this._routeMap[path] = route;
}


FlowRouter.middleware = function (middleware) {
  this._middleware.push(middleware);
}


FlowRouter._getCurrentRoute = function () {
  return this._routeMap[this._current];
}
