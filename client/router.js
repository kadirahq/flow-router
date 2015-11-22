Router = class extends SharedRouter {
  constructor() {
    super();

    this.globals = [];
  
    this._current = {};
  
    // tracks the current path change
    this._onEveryPath = new Tracker.Dependency();
  
    this._globalRoute = new Route(this);
  
    // if _askedToWait is true. We don't automatically start the router
    // in Meteor.startup callback. (see client/_init.js)
    // Instead user need to call `.initialize()
    this._askedToWait = false;
    this._initialized = false;
    this._triggersEnter = [];
    this._triggersExit = [];
    this._updateCallbacks();
    this.notFound = this.notfound = null;
  
    // Meteor exposes to the client the path prefix that was defined using the
    // ROOT_URL environement variable on the server using the global runtime
    // configuration. See #315.
    this._basePath = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';
  
    // this is a chain contains a list of old routes
    // most of the time, there is only one old route
    // but when it's the time for a trigger redirect we've a chain
    this._oldRouteChain = [];
  
    this.env = {
      replaceState: new Meteor.EnvironmentVariable(),
      reload: new Meteor.EnvironmentVariable(),
      trailingSlash: new Meteor.EnvironmentVariable()
    };
  
    // redirect function used inside triggers
    this._redirectFn = (pathDef, fields, queryParams) => {
      if (/^http(s)?:\/\//.test(pathDef)) {
        const message = "Redirects to URLs outside of the app are not supported in this version of Flow Router. Use 'window.location = yourUrl' instead";
        throw new Error(message);
      }

      this.withReplaceState(() => {
        const path = FlowRouter.path(pathDef, fields, queryParams);
        this._page.redirect(path);
      });
    };

    this._initTriggersAPI();
  }
  
  route(pathDef, options, group) {
    const route = super.route(pathDef, options, group);

    // calls when the page route being activates
    route._actionHandle = (context, next) => {
      const oldRoute = this._current.route;
      this._oldRouteChain.push(oldRoute);
  
      let queryParams = this._qs.parse(context.querystring);
      // _qs.parse() gives us a object without prototypes,
      // created with Object.create(null)
      // Meteor's check doesn't play nice with it.
      // So, we need to fix it by cloning it.
      // see more: https://github.com/meteorhacks/flow-router/issues/164
      queryParams = JSON.parse(JSON.stringify(queryParams));
  
      this._current = {
        path: context.path,
        context: context,
        params: context.params,
        queryParams: queryParams,
        route: route,
        oldRoute: oldRoute
      };
  
      // we need to invalidate if all the triggers have been completed
      // if not that means, we've been redirected to another path
      // then we don't need to invalidate
      const afterAllTriggersRan = () => {
        this._applyRoute();
      };
  
      const triggers = this._triggersEnter.concat(route._triggersEnter);
      Triggers.runTriggers(
        triggers,
        this._current,
        this._redirectFn,
        afterAllTriggersRan
      );
    };
  
    // calls when you exit from the page js route
    route._exitHandle = (context, next) => {
      const triggers = this._triggersExit.concat(route._triggersExit);
      Triggers.runTriggers(
        triggers,
        this._current,
        this._redirectFn,
        next
      );
    };
  
    this._updateCallbacks();
  
    return route;
  }
  
  path(pathDef, fields, queryParams) {
    return super.path(pathDef, fields, queryParams);
  }
  
  go(pathDef, fields, queryParams) {
    const path = this.path(pathDef, fields, queryParams);
  
    const useReplaceState = this.env.replaceState.get();
    if(useReplaceState) {
      this._page.replace(path);
    } else {
      this._page(path);
    }
  }
  

  
  reload() {
    this.env.reload.withValue(true, () => {
      this._page.replace(this._current.path);
    });
  }
  
  redirect(path) {
    this._page.redirect(path);
  }
  
  setParams(newParams) {
    if (!this._current.route) {
      return false;
    }
  
    const pathDef = this._current.route.pathDef;
    const existingParams = this._current.params;
    let params = {};
    Object.keys(existingParams).forEach((key) => {
      params[key] = existingParams[key];
    });
  
    // _.extend(dst, src1, src2) can be replaced with Object.assign(dst, src1, src2) in ES2015
    params = Object.assign(params, newParams);
    const queryParams = this._current.queryParams;
  
    this.go(pathDef, params, queryParams);
    return true;
  }
  
  setQueryParams(newParams) {
    if (!this._current.route) {
      return false;
    }
  
    const queryParams = _.clone(this._current.queryParams);
    // Object.assign can be used instead of _.extend
    Object.assign(queryParams, newParams);
  
    for (let k in queryParams) {
      if (queryParams[k] === null || queryParams[k] === undefined) {
        delete queryParams[k];
      }
    }
  
    const pathDef = this._current.route.pathDef;
    const params = this._current.params;
    this.go(pathDef, params, queryParams);
    return true;
  }
  
  withReplaceState(fn) {
    return this.env.replaceState.withValue(true, fn);
  }
  
  withTrailingSlash(fn) {
    return this.env.trailingSlash.withValue(true, fn);
  }
  
  _notfoundRoute(context) {
    this._current = {
      path: context.path,
      context: context,
      params: [],
      queryParams: {},
    };
  
    // XXX this.notfound kept for backwards compatibility
    this.notFound = this.notFound || this.notfound;
    if (!this.notFound) {
      console.error("There is no route for the path:", context.path);
      return;
    }
  
    this._current.route = new Route(this, "*", this.notFound);
    this._applyRoute();
  }
  
  initialize(options) {
    options = options || {};
  
    if (this._initialized) {
      throw new Error("FlowRouter is already initialized");
    }
  
    this._updateCallbacks();
  
    // Implementing idempotent routing
    // by overriding page.js`s "show" method.
    // Why?
    // It is impossible to bypass exit triggers,
    // because they execute before the handler and
    // can not know what the next path is, inside exit trigger.
    //
    // we need override both show, replace to make this work
    // since we use redirect when we are talking about withReplaceState
    ['show', 'replace'].forEach((fnName) => {
      const original = this._page[fnName];
      this._page[fnName] = (path, state, dispatch, push) => {
        const reload = this.env.reload.get();
        if (!reload && this._current.path === path) {
          return;
        }
  
        original.call(this, path, state, dispatch, push);
      };
    });
  
    // this is very ugly part of pagejs and it does decoding few times
    // in unpredicatable manner. See #168
    // this is the defa_ult behaviour and we need keep it like that
    // we are doing a hack. see .path()
    this._page.base(this._basePath);
    this._page({
      decodeURLComponents: true,
      hashbang: !!options.hashbang
    });
  
    this._initialized = true;
  }
  
  _applyRoute() {
    // see the definition of `this._processingContexts`
    const currentContext = this._current;
    const route = currentContext.route;
    const path = currentContext.path;
  
    // otherwise, computations inside action will trigger to re-run
    // this computation. which we do not need.
    Tracker.nonreactive(() => {
      let isRouteChange = currentContext.oldRoute !== currentContext.route;
      const isFirstRoute = !currentContext.oldRoute;
      // first route is not a route change
      if(isFirstRoute) {
        isRouteChange = false;
      }
  
      // Clear oldRouteChain just before calling the action
      // We still need to get a copy of the oldestRoute first
      // It's very important to get the oldest route and registerRouteClose() it
      // See: https://github.com/kadirahq/flow-router/issues/314
      const oldestRoute = this._oldRouteChain[0];
      this._oldRouteChain = [];
  
      currentContext.route.registerRouteChange(currentContext, isRouteChange);
      route.callAction(currentContext);
  
      Tracker.afterFlush(() => {
        this._onEveryPath.changed();
        if (isRouteChange) {
          // We need to trigger that route (definition itself) has changed.
          // So, we need to re-run all the register callbacks to current route
          // This is pretty important, otherwise tracker
          // can't identify new route's items
  
          // We also need to afterFlush, otherwise this will re-run
          // helpers on templates which are marked for destroying
          if (oldestRoute) {
            oldestRoute.registerRouteClose();
          }
        }
      });
    });
  }
  
  _updateCallbacks() {
    this._page.callbacks = [];
    this._page.exits = [];
  
    this._routes.forEach((route) => {
      this._page(route.pathDef, route._actionHandle);
      this._page.exit(route.pathDef, (context, next) => {
        // XXX: With React, exit handler gets called twice
        // We've not debugged into why yet, but it's an issue
        // so, we need to manually handle it like this
        if (this._oldExitPath === context.path) {
          return next();
        }
  
        this._oldExitPath = context.path;
        route._exitHandle(context, next);
      });
    });
  
    this._page("*", (context) => {
      this._notfoundRoute(context);
    });
  }
  
  _initTriggersAPI() {
    this.triggers = {
      enter: (triggers, filter) => {
        triggers = Triggers.applyFilters(triggers, filter);
        if (triggers.length) {
          this._triggersEnter = this._triggersEnter.concat(triggers);
        }
      },
  
      exit: (triggers, filter) => {
        triggers = Triggers.applyFilters(triggers, filter);
        if (triggers.length) {
          this._triggersExit = this._triggersExit.concat(triggers);
        }
      }
    };
  }
  
  wait() {
    if (this._initialized) {
      throw new Error("can't wait after FlowRouter has been initialized");
    }
  
    this._askedToWait = true;
  }
}

// Implementing Reactive APIs
const reactiveApis = [
  'getParam',
  'getQueryParam',
  'getRouteName',
  'watchPathChange'
];

reactiveApis.forEach((api) => {
  Router.prototype[api] = function (arg1) {
    // when this is calling, there may not be any route initiated
    // so we need to handle it
    const currentRoute = this._current.route;
    if(!currentRoute) {
      this._onEveryPath.depend();
      return;
    }

    // currently, there is only one argument. If we've more let's add more args
    // this is not clean code, but better in performance
    return currentRoute[api].call(currentRoute, arg1);
  };
});

Router.prototype._page = page;
Router.prototype._qs = qs;
