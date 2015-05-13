Router = function () {
  this.globals = [];
  this.subscriptions = Function.prototype;

  this._tracker = this._buildTracker();
  this._current = {};
  this._routeName = new ReactiveVar();
  this._hash = new ReactiveVar();
  this._params = new ReactiveDict();
  this._queryParams = new ReactiveDict();

  this._currentTracker = new Tracker.Dependency();
  this._globalRoute = new Route(this);

  this._middleware = [];
  this._routes = [];
  this._routesMap = {};
  this._updateCallbacks();
  this.notFound = this.notfound = null;
  // indicate it's okay (or not okay) to run the tracker
  // when doing subscriptions
  this.safeToRun = false;
};

Router.prototype.route = function(path, options, group) {
  if (!/^\/.*/.test(path)) {
    var message = "route's path must start with '/'";
    throw new Error(message);
  }

  options = options || {};
  var self = this;
  var route = new Route(this, path, options, group);

  route._handler = function (context, next) {
    self._current = {
      path: context.path,
      context: context,
      hash: context.hash,
      params: context.params,
      queryParams: self._qs.parse(context.querystring),
      route: route
    };

    self._invalidateTracker();
  };

  this._routes.push(route);
  if (options.name) {
    this._routesMap[options.name] = route;
  }

  this._updateCallbacks();

  return route;
};

Router.prototype.group = function(options) {
  return new Group(this, options);
};

Router.prototype.path = function(pathDef, fields, queryParams, hash) {
  if (this._routesMap[pathDef]) {
    pathDef = this._routesMap[pathDef].path;
  }

  fields = fields || {};
  var regExp = /(:[\w\(\)\\\+\*\.\?]+)+/g;
  var path = pathDef.replace(regExp, function(key) {
    var firstRegexpChar = key.indexOf("(");
    // get the content behind : and (\\d+/)
    key = key.substring(1, (firstRegexpChar > 0)? firstRegexpChar: undefined);
    // remove +?*
    key = key.replace(/[\+\*\?]+/g, "");

    return fields[key] || "";
  });

  var strQueryParams = this._qs.stringify(queryParams || {});
  if(strQueryParams) {
    path += "?" + strQueryParams;
  }

  if(hash) {
    path += "#" + hash;
  }

  return path;
};

Router.prototype.go = function(pathDef, fields, queryParams, hash) {
  var path = this.path(pathDef, fields, queryParams, hash);

  if (this._current.path !== path) {
    this._page(path);
  }
};

Router.prototype.redirect = function(path) {
  this._page.redirect(path);
};

Router.prototype.setHash = function(newHash) {
  if(!this._current.route) {return false;}

  var pathDef = this._current.route.path;
  var params = this._current.params;
  var queryParams = this._current.queryParams;
  var hash = newHash;

  this.go(pathDef, params, queryParams, hash);
  return true;
};

Router.prototype.setParams = function(newParams) {
  if(!this._current.route) {return false;}

  var pathDef = this._current.route.path;
  var existingParams = this._current.params;
  var params = {};
  _.each(_.keys(existingParams), function(key) {
    params[key] = existingParams[key];
  });

  params = _.extend(params, newParams);
  var queryParams = this._current.queryParams;
  var hash = this._current.hash;

  this.go(pathDef, params, queryParams, hash);
  return true;
};

Router.prototype.setQueryParams = function(newParams) {
  if(!this._current.route) {return false;}

  var queryParams = _.clone(this._current.queryParams);
  _.extend(queryParams, newParams);

  for (var k in queryParams) {
    if (queryParams[k] === null || queryParams[k] === undefined) {
      delete queryParams[k];
    }
  }

  var pathDef = this._current.route.path;
  var params = this._current.params;
  var hash = this._current.hash;

  this.go(pathDef, params, queryParams, hash);
  return true;
};

// .current is not reactive
// This is by design. use .getParam() instead
// If you really need a reactive current support, use .reactiveCurrent()
Router.prototype.current = function() {
  return this._current;
};

Router.prototype.reactiveCurrent = function() {
  this._currentTracker.depend();
  return this.current();
};

Router.prototype.getRouteName = function() {
  return this._routeName.get();
};

Router.prototype.getHash = function() {
  return this._hash.get();
};

Router.prototype.getParam = function(key) {
  return this._params.get(key);
};

Router.prototype.getQueryParam = function(key) {
  return this._queryParams.get(key);
};

Router.prototype._registerRouteName = function() {
  this._routeName.set(this._current.route.name);
};

Router.prototype._registerHash = function() {
  this._hash.set(this._current.hash);
};

Router.prototype._registerParams = function() {
  var params = this._current.params;
  this._updateReactiveDict(this._params, params);
};

Router.prototype._registerQueryParams = function() {
  var queryParams = this._current.queryParams;
  this._updateReactiveDict(this._queryParams, queryParams);
};

Router.prototype._updateReactiveDict = function(dict, newValues) {
  var currentKeys = _.keys(newValues);
  var oldKeys = _.keys(dict.keyDeps);

  // set new values
  //  params is an array. So, _.each(params) does not works
  //  to iterate params
  _.each(currentKeys, function(key) {
    dict.set(key, newValues[key]);
  });

  // remove keys which does not exisits here
  var removedKeys = _.difference(oldKeys, currentKeys);
  _.each(removedKeys, function(key) {
    dict.set(key, undefined);
  });
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

Router.prototype.ready = function() {
  console.warn("'FlowRouter.ready()' is deprecated. Use 'FlowRouter.subsReady()' instead");
  return this.subsReady.apply(this, arguments);
};

Router.prototype.subsReady = function() {
  var currentRoute = this.current().route;
  var globalRoute = this._globalRoute;

  // we need to depend for every route change and
  // rerun subscriptions to check the ready state
  this._currentTracker.depend();

  if(!currentRoute) {
    return false;
  }

  var subscriptions;
  if(arguments.length === 0) {
    subscriptions = _.values(globalRoute.getAllSubscriptions());
    subscriptions = subscriptions.concat(_.values(currentRoute.getAllSubscriptions()));
  } else {
    subscriptions = _.map(arguments, function(subName) {
      return globalRoute.getSubscription(subName) || currentRoute.getSubscription(subName);
    });
  }

  var isReady =  _.every(subscriptions, function(sub) {
    return sub && sub.ready();
  });

  return isReady;
};

Router.prototype._notfoundRoute = function(context) {
  this._current = {
    path: context.path,
    context: context,
    params: [],
    queryParams: {},
  };

  // XXX this.notfound kept for backwards compatibility
  this.notFound = this.notFound || this.notfound;
  if(!this.notFound) {
    console.error("There is no route for the path:", context.path);
    return;
  }

  this._current.route = new Route(this, "*", this.notFound);
  this._invalidateTracker();
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
    if(!self._current || !self._current.route) {
      return;
    }

    var route = self._current.route;
    var path = self._current.path;

    if(!self.safeToRun) {
      var message =
        "You can't use reactive data sources like Session" +
        " inside the `.subscriptions` method!";
      throw new Error(message);
    }

    // We need to run subscriptions inside a Tracker
    // to stop subs when switching between routes
    // But we don't need to run this tracker with
    // other reactive changes inside the .subscription method
    // We tackle this with the `safeToRun` variable
    self._globalRoute.clearSubscriptions();
    self.subscriptions.call(self._globalRoute, path);
    route.callSubscriptions(self._current);

    // otherwise, computations inside action will trigger to re-run
    // this computation. which we do not need.
    Tracker.nonreactive(function() {
      route.callAction(self._current);
    });

    self._registerRouteName();
    self._registerHash();
    self._registerParams();
    self._registerQueryParams();

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

  self._page("*", function(context) {
    self._notfoundRoute(context);
  });
};

Router.prototype._page = page;
Router.prototype._qs = qs;
