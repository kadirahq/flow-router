
FlowRouter = {
  _current: null,
  _routeMap: {},
};

// @api
FlowRouter.route = function (path, options) {
  var self = this;
  var route = self._routeMap[path] = new FlowRoute(path, options);
  return route;
}


FlowRouter.middleware = function (middlewareFn) {
  // TODO
}


FlowRouter.setState = function (name, value) {
  // TODO
}


FlowRouter.getState = function (name) {
  // TODO
}
