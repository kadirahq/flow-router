Router = function () {
  this.globals = [];
  this.subscriptions = Function.prototype;

  this._tracker = this._buildTracker();
  this._current = {};
  this._currentTracker = new Tracker.Dependency();
  this._globalRoute = new Route(this);

  this._middleware = [];
  this._routes = [];
  this._updateCallbacks();

  // indicate it's okay (or not okay) to run the tracker
  // when doing subscriptions
  this.safeToRun = false;
}

Router.prototype.route = function(path, options) {
  var self = this;
  var route = new Route(this, path, options);

  route._handler = function (context, next) {
    self._current = {
      path: path,
      context: context,
      params: context.params,
      route: route
    };

    // pick states from url
    var states = self._qs.parse(context.querystring);
    self._globalRoute._states = _.pick(states, self.globals);
    self._current.route._states = _.omit(states, this.globals);

    self._invalidateTracker();
  };

  this._routes.push(route);
  this._updateCallbacks();

  return route;
};

Router.prototype.go = function(path) {
  this._page(path);
};

Router.prototype.redirect = function(path) {
  this._page.redirect(path);
};

Router.prototype.current = function() {
  this._currentTracker.depend();
  return this._current;
};

Router.prototype.middleware = function(middlewareFn) {
  var self = this;
  var mw = function(ctx, next) {
    // make sure middlewars run after Meteor has been initialized
    // this is very important for specially for fast render and Meteor.user()
    // availability
    Meteor.startup(function() {
      middlewareFn(ctx.pathname, processNext);
    });

    function processNext(path) {
      if(path) {
        return self._page.redirect(path);
      }
      next();
    }
  };

  this._middleware.push(mw);
  this._updateCallbacks();
  return this;
};

Router.prototype.getState = function(name) {
  if(_.contains(this.globals, name)) {
    return this._globalRoute._states[name];
  } else if(this._current.route) {
    return this._current.route._states[name];
  } else {
    return null;
  }
};


Router.prototype.getAllStates = function() {
  var locals = this._current.route ? this._current.route._states : {};
  return _.extend({}, locals, this._globalRoute._states);
};


Router.prototype.setState = function(name, value) {
  if(_.contains(this.globals, name)) {
    this._globalRoute._states[name] = value;
    this._invalidateTracker();
  } else if(this._current.route) {
    this._current.route._states[name] = value;
    this._invalidateTracker();
  } else {
    // nothing to set
  }
};


Router.prototype.removeState = function(name) {
  if(_.contains(this.globals, name)) {
    delete this._globalRoute._states[name];
    this._invalidateTracker();
  } else if(this._current.route) {
    delete this._current.route._states[name];
    this._invalidateTracker();
  } else {
    // nothing to remove
  }
};


Router.prototype.clearStates = function() {
  if(this._current.route) {
    this._current.route._states = {};
  }

  this._globalRoute._states = {};
  this._invalidateTracker();
};


Router.prototype.ready = function() {
  var currentRoute = this.current().route;
  if(!currentRoute) return false;

  if(arguments.length == 0) {
    var subscriptions = _.values(currentRoute.getAllSubscriptions());
  } else {
    var subscriptions = _.map(arguments, function(subName) {
      return currentRoute.getSubscription(subName);
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
};


Router.prototype.notfound = function(options) {
  var self = this;
  var route = new Route(this, '*', options);

  route._handler = function (context, next) {
    self._current = {
      path: '*',
      context: context,
      params: context.params,
      route: route
    };

    self._invalidateTracker();
  };

  this._notfound = route;
  this._updateCallbacks();
};


Router.prototype.initialize = function() {
  var self = this;

  this._middleware.push(function (ctx, next) {
    setTimeout(function() {
      var str = location.search.slice(1);
      ctx.params.query = self._qs.parse(str);
      next();
    }, 0);
  });

  this._updateCallbacks();
  // initialize
  this._page();
};

Router.prototype._buildTracker = function() {
  var self = this;

  // main autorun function
  var tracker = Tracker.autorun(function () {
    if(!self._current || !self._current.route) return;
    var route = self._current.route;
    var path = self._current.path;
    var context = self._current.context;

    if(!self.safeToRun) {
      var message =
        "You can't use reactive data sources like Session" +
        " inside the `.subscriptions` method!";
      throw new Error(message);
    }

    var states = self.getAllStates();
    if(!_.isEmpty(states)) {
      var query = self._qs.stringify(states);
      history.replaceState({}, '', location.pathname + '?' + query);
    }

    // We need to run subscriptions inside a Tracker
    // to stop subs when switching between routes
    // But we don't need to run this tracker with
    // other reactive changes inside the .subscription method
    // We tackle this with the `safeToRun` variable
    self.subscriptions.call(self._globalRoute, path);
    route.callSubscriptions(context);

    // otherwise, computations inside action will trigger to re-run
    // this computation. which we do not need.
    Tracker.nonreactive(function() {
      route.callAction(context);
    });

    self._currentTracker.changed();
    self.safeToRun = false;
  });

  return tracker;
};

Router.prototype._invalidateTracker = function() {
  this.safeToRun = true;
  this._tracker.invalidate();
};

Router.prototype._updateCallbacks = function () {
  var self = this;

  // add global middleware
  self._page.callbacks = [];
  _.each(self._middleware, function(fn) {
    self._page("*", fn);
  });

  _.each(self._routes, function(route) {
    self._page(route.path, route._handler);
  });
};

Router.prototype._page = window.page;
delete window.page;

Router.prototype._qs = qs;