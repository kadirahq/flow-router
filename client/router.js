
FlowRouter = {
  _current: {},
  _currentTracker: new Tracker.Dependency(),
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
    self._current = {
      path: path,
      context: context,
      params: context.params,
      route: route
    };
    FlowRouter._tracker.invalidate();
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
    var context = _.pick(ctx, 'params', 'path');
    middlewareFn(context, next);
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
};

FlowRouter.current = function() {
  FlowRouter._currentTracker.depend();
  return FlowRouter._current;
};

FlowRouter.ready = function() {
  var currentRouter = FlowRouter.current().route;
  if(currentRouter) {

    if(arguments.length == 0) {
      var subscriptions = _.values(currentRouter.getAllSubscriptions());
    } else {
      var subscriptions = _.map(arguments, function(subName) {
        return currentRouter.getSubscription(subName);
      });
    }

    for(var lc = 0; lc<subscriptions.length; lc++) {
      var sub = subscriptions[lc];
      if(!sub) {
        return false;
      } else if(sub.ready() == false) {
        return false;
      }
    }

    return true;
  } else {
    return false;
  }
};

// run current route subs
FlowRouter._tracker = Tracker.autorun(function () {
  var path = FlowRouter._current.path;
  var route = FlowRouter._current.route;
  var context = FlowRouter._current.context;
  if(route) {
    if(!_.isEmpty(FlowRouter._states)) {
      var query = qs.stringify(FlowRouter._states);
      history.replaceState({}, "", location.pathname + '?' + query);
    }

    // FIXME: we need to create another logic to just to run the subscriptions
    // then pick them and run them inside an autorun.
    // Then user can't write reactive content inside the router's 
    // subscriptions method. Now which is possible
    route.subscriptions(context.params);

    // otherwise, computations inside render will trigger to re-run 
    // this computation. which we do not need.
    Tracker.nonreactive(function() {
      route.render(context.params);
    });

    FlowRouter._currentTracker.changed();
  }
});

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
