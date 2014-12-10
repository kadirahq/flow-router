FlowRouter = {
  _routeMap: {},
  _middleware: [],
  _FlowRoute: FlowRoute,
};

if(Meteor.isClient) {
  _.extend(FlowRouter, {
    _current: null,
    _clientRouter: ClientRouter,
    _globalStates: {},
  });
}


FlowRouter.route = function (path, options) {
  var route = new this._FlowRoute(path, options);
  this._routeMap[path] = route;
};


FlowRouter.middleware = function (middleware) {
  this._middleware.push(middleware);

  if(Meteor.isClient) {
    this._clientRouter.middleware(middleware);
  }
};


FlowRouter.subscribe = function (middleware) {
  var route = this._getCurrentRoute();
  if(route) {
    route.subscriptions();
  }
};


FlowRouter._getCurrentRoute = function () {
  return this._routeMap[this._current];
};


if(Meteor.isClient) {
  FlowRouter.go = function(path) {
    this._current = path;
    this._subsComputation.invalidate();
    this._clientRouter.go(path, {
      states: this.getStates()
    });
  };


  FlowRouter.setState = function (name, value, options) {
    options = _.extend(this._getDefaultStateOptions(), options);
    if(options.global) {
      this._globalStates[name] = value;
      this._clientRouter.setState(name, value, options);
    } else {
      var route = this._getCurrentRoute();
      route.setState(name, value, options);
    }
  };


  FlowRouter.getState = function (name) {
    var route = this._getCurrentRoute();
    var routeState = route.getState(name);
    var globalState = this._globalStates[name];
    return routeState || globalState;
  };


  FlowRouter.getStates = function () {
    var route = this._getCurrentRoute();
    var routeStates = route.getStates();
    var globalStates = this._globalStates;
    return _.extend({}, globalStates, routeStates);
  };


  FlowRouter._getDefaultStateOptions = function () {
    return {
      global: false,
    };
  };


  FlowRouter._subsComputation = Tracker.autorun(function () {
    FlowRouter.subscribe();
  });
}
