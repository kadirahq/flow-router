Router = function () {
  this.globals = [];
  this.subscriptions = Function.prototype;

  this._tracker = this._buildTracker();
  this._current = {};

  // tracks the current path change
  this._onEveryPath = new Tracker.Dependency();

  this._globalRoute = new Route(this);

  this._triggersEnter = [];
  this._triggersExit = [];
  this._middleware = [];
  this._routes = [];
  this._routesMap = {};
  this._updateCallbacks();
  this.notFound = this.notfound = null;
  // indicate it's okay (or not okay) to run the tracker
  // when doing subscriptions
  // using a number and increment it help us to support FlowRouter.go() 
  // and legitimate reruns inside tracker on the same event loop.
  // this is a solution for #145
  this.safeToRun = 0;

  var self = this;
  this.triggers = {
    enter: self._getRegisterTriggersFn(self._triggersEnter),
    exit: self._getRegisterTriggersFn(self._triggersExit)
  };

  this.env = {
    replaceState: new Meteor.EnvironmentVariable(),
    reload: new Meteor.EnvironmentVariable()
  };
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
    var oldRoute = self._current.route;

    self._current = {
      path: context.path,
      context: context,
      params: context.params,
      queryParams: self._qs.parse(context.querystring),
      route: route,
      oldRoute: oldRoute
    };

    // to backward compatibility
    self._current.params.query = self._current.queryParams;

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

Router.prototype.path = function(pathDef, fields, queryParams) {
  if (this._routesMap[pathDef]) {
    pathDef = this._routesMap[pathDef].path;
  }

  // remove trailing slash(es)
  // but keep the root slash if it's the only one
  pathDef = pathDef.match(/^\/{1}$/) ? pathDef : pathDef.replace(/\/+$/, "");

  fields = fields || {};
  var regExp = /(:[\w\(\)\\\+\*\.\?]+)+/g;
  var path = pathDef.replace(regExp, function(key) {
    var firstRegexpChar = key.indexOf("(");
    // get the content behind : and (\\d+/)
    key = key.substring(1, (firstRegexpChar > 0)? firstRegexpChar: undefined);
    // remove +?*
    key = key.replace(/[\+\*\?]+/g, "");

    return encodeURIComponent(fields[key] || "");
  });

  var strQueryParams = this._qs.stringify(queryParams || {});
  if(strQueryParams) {
    path += "?" + strQueryParams;
  }

  return path;
};

Router.prototype.go = function(pathDef, fields, queryParams) {
  var path = this.path(pathDef, fields, queryParams);
  
  var useReplaceState = this.env.replaceState.get();
  if(useReplaceState) {
    this._page.redirect(path);
  } else {
    this._page(path);
  }
};

Router.prototype.reload = function() {
  var self = this;

  self.env.reload.withValue(true, function() {
    self._page.replace(self._current.path);
  });
};

Router.prototype.redirect = function(path) {
  this._page.redirect(path);
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

  this.go(pathDef, params, queryParams);
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
  this.go(pathDef, params, queryParams);
  return true;
};

// .current is not reactive
// This is by design. use .getParam() instead
// If you really need to watch the path change, use .watchPathChange()
Router.prototype.current = function() {
  return this._current;
};

Router.prototype.reactiveCurrent = function() {
  var warnMessage = 
    ".reactiveCurrent() is deprecated. " +
    "Use .watchPathChange() instead";
  console.warn(warnMessage);
  
  this.watchPathChange();
  return this.current();
};

// Implementing Reactive APIs
var reactiveApis = [
  'getParam', 'getQueryParam', 
  'getRouteName', 'watchPathChange'
];
reactiveApis.forEach(function(api) {
  Router.prototype[api] = function(arg1) {
    // when this is calling, there may not be any route initiated
    // so we need to handle it
    var currentRoute = this._current.route;
    if(!currentRoute) {
      this._onEveryPath.depend();
      return;
    }

    // currently, there is only one argument. If we've more let's add more args
    // this is not clean code, but better in performance
    return currentRoute[api].call(currentRoute, arg1);
  };
});

Router.prototype.middleware = function(middlewareFn) {
  console.warn("'middleware' is deprecated. Use 'triggers' instead");
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
  var callback = null;
  var args = _.toArray(arguments);

  if (typeof _.last(args) === "function") {
    callback = args.pop();
  }

  var currentRoute = this.current().route;
  var globalRoute = this._globalRoute;

  // we need to depend for every route change and
  // rerun subscriptions to check the ready state
  this._onEveryPath.depend();

  if(!currentRoute) {
    return false;
  }

  var subscriptions;
  if(args.length === 0) {
    subscriptions = _.values(globalRoute.getAllSubscriptions());
    subscriptions = subscriptions.concat(_.values(currentRoute.getAllSubscriptions()));
  } else {
    subscriptions = _.map(args, function(subName) {
      return globalRoute.getSubscription(subName) || currentRoute.getSubscription(subName);
    });
  }

  var isReady = function() {
    var ready =  _.every(subscriptions, function(sub) {
      return sub && sub.ready();
    });

    return ready;
  };

  if (callback) {
    Tracker.autorun(function(c) {
      if (isReady()) {
        callback();
        c.stop();
      }
    });
  } else {
    return isReady();
  }
};

Router.prototype.withReplaceState = function(fn) {
  return this.env.replaceState.withValue(true, fn);
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
  this._updateCallbacks();

  // Implementing idempotent routing
  // by overriding page.js`s "show" method.
  // Why?
  // It is impossible to bypass exit triggers,
  // becuase they execute before the handler and
  // can not know what the next path is, inside exit trigger.
  var originalShow = this._page.show;

  this._page.show = function(path, state, dispatch, push) {
    var reload = self.env.reload.get();
    if (!reload && self._current.path === path) {
      return;
    }

    originalShow(path, state, dispatch, push);
  };

  // initialize
  this._page({decodeURLComponents: false});
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

    if(self.safeToRun === 0) {
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
      var currentContext = self._current;

      self._processTriggersEnter(currentContext);

      var isRouteChange = currentContext.oldRoute !== currentContext.route;
      var isFirstRoute = !currentContext.oldRoute;
      // first route is not a route change
      if(isFirstRoute) {
        isRouteChange = false;
      }

      currentContext.route.registerRouteChange(currentContext, isRouteChange);
      route.callAction(currentContext);

      Tracker.afterFlush(function() {
        self._onEveryPath.changed();
        if(isRouteChange) {
          // We need to trigger that route (definition itself) has changed.
          // So, we need to re-run all the register callbacks to current route
          // This is pretty important, otherwise tracker 
          // can't identify new route's items

          // We also need to afterFlush, otherwise this will re-run
          // helpers on templates which are marked for destroying
          currentContext.oldRoute.registerRouteClose();
        }
      });
    });

    self.safeToRun--;
  });

  return tracker;
};

Router.prototype._invalidateTracker = function() {
  this.safeToRun++;
  this._tracker.invalidate();
};

Router.prototype._getRegisterTriggersFn = function(triggers) {
  var fn = function(triggerFns, options) {
    options = options || {};

    if (options.only && options.except) {
      var message = "triggers does not support 'only' and 'except' at the same time.";
      throw new Error(message);
    }

    _.each(triggerFns, function(fn) {
      if (typeof fn !== 'function') {
        return;
      }

      if (options.only) {
        fn._only = {};
        _.each(options.only, function(name) {
          fn._only[name] = 1;
        });
      }

      if (options.except) {
        fn._except = {};
        _.each(options.except, function(name) {
          fn._except[name] = 1;
        });
      }

      triggers.push(fn);
    });
  };

  return fn;
};

Router.prototype._shouldCallTrigger = function(current, fn) {
  var name = current.route.name;
  var shouldCall;

  if (typeof fn !== 'function') {
    return false;
  }

  if (fn._only) {
    shouldCall = !!fn._only[name];
  } else if (fn._except) {
    shouldCall = !fn._except[name];
  } else {
    shouldCall = true;
  }

  return shouldCall;
};

Router.prototype._processTriggersEnter = function(current) {
  var self = this;

  _.each(this._triggersEnter, function(fn) {
    if (self._shouldCallTrigger(current, fn)) {
      fn(current);
    }
  });
};

Router.prototype._processTriggersExit = function(ctx, next) {
  var self = this;

  _.each(self._triggersExit, function(fn) {
    if (self._shouldCallTrigger(self._current, fn)) {
      fn(self._current);
    }
  });

  next();
};

Router.prototype._registerRouteTriggersExit = function(route) {
  var self = this;

  if (route._triggersExit.length > 0) {
    // add route's exit triggers
    self._page.exit(route.path, function(ctx, next) {
      _.each(route._triggersExit, function(fn) {
        if (typeof fn === 'function') {
          fn(self._current);
        }
      });

      next();
    });
  }
};

Router.prototype._updateCallbacks = function () {
  var self = this;

  self._page.callbacks = [];
  self._page.exits = [];

  // add global middleware
  _.each(self._middleware, function(fn) {
    self._page("*", fn);
  });

  _.each(self._routes, function(route) {
    self._page(route.path, route._handler);
    self._registerRouteTriggersExit(route);
  });

  self._page.exit("*", self._processTriggersExit.bind(self));

  self._page("*", function(context) {
    self._notfoundRoute(context);
  });
};

Router.prototype._page = page;
Router.prototype._qs = qs;
