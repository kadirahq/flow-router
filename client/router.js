
FlowRouter = {
  _current: new ReactiveVar,
  _currentContext: null,
  _routeMap: {},
  _middleware: [],
  _states: {},
};

// @api
FlowRouter.route = function (path, options) {
  var self = this;
  var route = self._routeMap[path] = new FlowRoute(path, options);

  page(path, function (context, next) {
    next();
    self._currentContext = context;
    self._current.set(path);
  });

  return route;
}


FlowRouter.go = function (path) {
  var idx = path.indexOf('?');
  if(idx >= 0) {
    // use user provded states
    var queryStr = path.substr(idx+1);
    var query = qs.parse(queryStr);
    this._states = query;
  }

  page(path);
}


FlowRouter.middleware = function (middlewareFn) {
  page(function (ctx, next) {
    middlewareFn(ctx.pathname, next);
  });
}


FlowRouter.setState = function (name, value) {
  if(value === null) {
    delete this._states[name];
  } else {
    this._states[name] = value;
  }

  FlowRouter._tracker.invalidate();
}


FlowRouter.getState = function (name) {
  return this._states[name];
}


// run current route subs
FlowRouter._tracker = Tracker.autorun(function () {
  var path = FlowRouter._current.get();
  var route = FlowRouter._routeMap[path];
  var context = FlowRouter._currentContext;
  if(route) {
    if(!_.isEmpty(FlowRouter._states)) {
      var query = qs.stringify(FlowRouter._states);
      history.replaceState({}, "", location.pathname + '?' + query);
    }

    route.subscriptions();
    route.render(context.params);
  }
})


// query string middleware
page(function (ctx, next) {
  // wait for `location` variable to update
  setTimeout(function() {
    var queryStr = location.search.slice(1);
    ctx.params.query = qs.parse(queryStr);
    next();
  }, 0);
});

Meteor.startup(function () {
  page();
})
