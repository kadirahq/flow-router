FlowRouter = {
  _current: null,
  _routeMap: {},
  _clientRouter: ClientRouter,
  _FlowRoute: FlowRoute,
  _globalStates: new ReactiveDict,
};


FlowRouter.route = function (path, options) {
  var route = new this._FlowRoute(path, options);
  this._routeMap[path] = route;
  this._clientRouter.route(path, options);
}


FlowRouter.setState = function (name, value, options) {
  options = options || this._getDefaultStateOptions();
  if(options.global) {
    this._globalStates.set(name, value);
  } else {
    var route = this._routeMap[this._current];
    route.setState(name, value, options);
  }

  this._clientRouter.setState(name, value, options)
}


FlowRouter.getState = function (name) {
  var route = this._routeMap[this._current];
  var routeState = route.getState(name);
  var globalState = this._globalStates.get(name);
  return routeState || globalState;
}


FlowRouter._getDefaultStateOptions = function () {
  return {
    global: false,
  };
}
