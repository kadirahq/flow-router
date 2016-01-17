const logger = console;

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
    this.notFound = this.notfound = null;

    // Meteor exposes to the client the path prefix that was defined using the
    // ROOT_URL environement variable on the server using the global runtime
    // configuration. See #315.
    this._basePath = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';

    // this is a chain contains a list of old routes
    // most of the time, there is only one old route
    // but when it's the time for a trigger redirect we've a chain
    this._oldRouteChain = [];

    this.env.replaceState = new Meteor.EnvironmentVariable();
    this.env.reload = new Meteor.EnvironmentVariable();

    // this holds route pathDefs
    this._routeDefs = [];

    this._initTriggersAPI();
    this._initClickHandlers();
  }

  route(pathDef, options, group) {
    const route = super.route(pathDef, options, group);
    const keys = [];
    const regexp = PathToRegexp(pathDef, keys);
    this._routeDefs.push({regexp, keys, pathDef, route});

    return route;
  }

  initialize(options) {
    options = options || {};

    if (this._initialized) {
      throw new Error('FlowRouter is already initialized');
    }

    this._initialized = true;
    const path = location.pathname + location.search + (location.hash || '');
    this.go(path);
  }

  wait() {
    if (this._initialized) {
      throw new Error("can't wait after FlowRouter has been initialized");
    }

    this._askedToWait = true;
  }

  reload() {
    this.env.reload.withValue(true, () => {
      this._page.replace(this._current.path);
    });
  }

  setParams(newParams) {
    if (!this._current.route) {
      return false;
    }

    const pathDef = this._current.route.pathDef;
    const existingParams = this._current.params;

    const params = {
      ...existingParams,
      ...newParams
    };
    const queryParams = this._current.queryParams;

    this.go(pathDef, params, queryParams);
    return true;
  }

  setQueryParams(newParams) {
    if (!this._current.route) {
      return false;
    }

    const queryParams = {
      ...this._current.queryParams,
      newParams
    };

    for (const k in queryParams) {
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

  go(pathDef, fields, queryParams) {
    const path = this.path(pathDef, fields, queryParams);

    if (!path) {
      return logger.error('Path is required for FlowRouter.go()');
    }

    // Implement idempotant routing
    const insideAReload = this.env.reload.get();
    if (this._current.path === path && !insideAReload) {
      return;
    }

    const qsStartIndex = path.indexOf('?');
    let pathWithoutQs = path;
    let queryString = "";

    if (qsStartIndex >= 0) {
      pathWithoutQs = path.substr(0, qsStartIndex);
      queryString = path.substr(qsStartIndex + 1);
    }

    const parsedQueryParams = Qs.parse(queryString);

    for (const index in this._routeDefs) {
      const routeDef = this._routeDefs[index];
      const matched = routeDef.regexp.exec(pathWithoutQs);
      if (matched) {
        const params = {};
        routeDef.keys.forEach(({name}, index) => {
          params[name] = matched[index + 1];
        });

        return this._navigate(path, routeDef.route, params, parsedQueryParams);
      }
    }

    const notFoundRoute = this._getNotFoundRoute();
    this._navigate(path, notFoundRoute, {}, parsedQueryParams);
  }

  _navigate(path, route, params, queryParams) {
    const context = {path, route, params, queryParams};

    let redirectArgs;
    const redirectFn = (...args) => {
      redirectArgs = args;
    };

    var triggers = this._triggersEnter.concat(route._triggersEnter);
    Triggers.runTriggers(
      triggers,
      context,
      redirectFn,
      () => {}
    );

    if (redirectArgs) {
      return this.go(...redirectArgs);
    }

    this._current = context;

    const useReplaceState = this.env.replaceState.get();
    if (useReplaceState) {
      history.replaceState({}, window.title, path);
    } else {
      history.pushState({}, window.title, path);
    }

    this._oldRoute = route;
    this._applyRoute();
  }

  _getNotFoundRoute() {
    const notFoundOptions = this.notFound || {
      action() {
        const current = FlowRouter.current();
        logger.error('There is no route for the path:', current.path);
      }
    };

    return new Route(this, "*", notFoundOptions);
  }

  _applyRoute() {
    // see the definition of `this._processingContexts`
    const currentContext = this._current;
    const route = currentContext.route;

    // otherwise, computations inside action will trigger to re-run
    // this computation. which we do not need.
    Tracker.nonreactive(() => {
      let isRouteChange = currentContext.oldRoute !== currentContext.route;
      const isFirstRoute = !currentContext.oldRoute;
      // first route is not a route change
      if (isFirstRoute) {
        isRouteChange = false;
      }

      const oldRoute = this._oldRoute;
      this._oldRoute = null;

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
          if (oldRoute) {
            oldRoute.registerRouteClose();
          }
        }
      });
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

  _getCurrentRouteContext() {
    return this._current;
  }

  _initClickHandlers() {
    var clickEvent =
      ('undefined' !== typeof document) && document.ontouchstart ?
      'touchstart' : 'click';
    document.addEventListener(clickEvent, onclick, false);

    function onclick(e) {
      if (1 !== which(e)) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        return;
      }

      if (e.defaultPrevented) {
        return;
      }

      // ensure link
      let el = e.target;
      while (el && 'A' !== el.nodeName) el = el.parentNode;
      if (!el || 'A' !== el.nodeName) {
        return;
      }

      // Ignore if tag has
      // 1. "download" attribute
      // 2. rel="external" attribute
      const externalLink =
        el.hasAttribute('download') ||
        el.getAttribute('rel') === 'external';

      if (externalLink) {
        return;
      }

      // ensure non-hash for the same path
      let link = el.getAttribute('href');
      if (el.pathname === location.pathname && (el.hash || '#' === link)) {
        return;
      }

      // Check for mailto: in the href
      if (link && link.indexOf('mailto:') > -1) {
        return;
      }

      // check target
      if (el.target) {
        return;
      }

      // rebuild path
      let path = el.pathname + el.search + (el.hash || '');
      e.preventDefault();
      this.go(path);
    }

    function which(e) {
      e = e || window.event;
      return null === e.which ? e.button : e.which;
    }
  }
};

// Implementing Reactive APIs
const reactiveApis = [
  'getParam',
  'getQueryParam',
  'getRouteName',
  'watchPathChange'
];

reactiveApis.forEach((api) => {
  Router.prototype[api] = function(arg1) {
    // when this is calling, there may not be any route initiated
    // so we need to handle it
    const currentRoute = this._current.route;
    if (!currentRoute) {
      this._onEveryPath.depend();
      return null;
    }

    // currently, there is only one argument. If we've more let's add more args
    // this is not clean code, but better in performance
    return currentRoute[api].call(currentRoute, arg1);
  };
});
