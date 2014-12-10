FlowRouter = {
  _current: null,
  _routeMap: {},
  _middleware: [],
  _clientRouter: ClientRouter,
  _FlowRoute: FlowRoute,
  _globalStates: new ReactiveDict,
};


FlowRouter.route = function (path, options) {
  var route = new this._FlowRoute(path, options);
  this._routeMap[path] = route;
}


FlowRouter.middleware = function (middleware) {
  this._middleware.push(middleware);
  this._clientRouter.middleware(middleware);
}


FlowRouter.subscribe = function (middleware) {
  var route = this._getCurrentRoute();
  route.subscriptions();
}


FlowRouter.setState = function (name, value, options) {
  options = _.extend(this._getDefaultStateOptions(), options);
  if(options.global) {
    this._globalStates.set(name, value);
    this._clientRouter.setState(name, value, options);
  } else {
    var route = this._getCurrentRoute();
    route.setState(name, value, options);
  }
}


FlowRouter.getState = function (name) {
  var route = this._routeMap[this._current];
  var routeState = route.getState(name);
  var globalState = this._globalStates.get(name);
  return routeState || globalState;
}


FlowRouter._getCurrentRoute = function () {
  return this._routeMap[this._current];
}


FlowRouter._getDefaultStateOptions = function () {
  return {
    global: false,
  };
}
