const logger = console;

Router = class extends SharedRouter {
  constructor() {
    super();

    // holds the current context
    this._current = {};

    // tracks the current path change
    this._onEveryPath = new Tracker.Dependency();
    this._params = new ReactiveDict();
    this._queryParams = new ReactiveDict();

    // if _askedToWait is true. We don't automatically start the router
    // in Meteor.startup callback. (see client/_init.js)
    // Instead user need to call `.initialize()
    this._askedToWait = false;
    this._initialized = false;

    this._triggersEnter = [];
    this._triggersExit = [];

    // Meteor exposes to the client the path prefix that was defined using the
    // ROOT_URL environement variable on the server using the global runtime
    // configuration. See #315.
    this._basePath = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';

    this.env.replaceState = new Meteor.EnvironmentVariable();
    this.env.reload = new Meteor.EnvironmentVariable();

    // this holds route pathDefs
    this._routeDefs = [];

    this._initTriggersAPI();
    this._initClickAnchorHandlers();
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

  watchPathChange() {
    this._onEveryPath.depend();
  }

  getParam(key) {
    return this._params.get(key);
  }

  getQueryParam(key) {
    return this._queryParams.get(key);
  }

  getRouteName() {
    this.watchPathChange();
    return this._current.route.name;
  }

  route(pathDef, options, group) {
    const route = super.route(pathDef, options, group);
    const keys = [];
    const regexp = PathToRegexp(pathDef, keys);
    this._routeDefs.push({regexp, keys, pathDef, route});

    return route;
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

    // XXX: Implement Meteor base path based routing.

    const qsStartIndex = path.indexOf('?');
    let pathWithoutQs = path;
    let queryString = "";
    if (qsStartIndex >= 0) {
      pathWithoutQs = path.substr(0, qsStartIndex);
      queryString = path.substr(qsStartIndex + 1);
    }
    const parsedQueryParams = Qs.parse(queryString);

    // Remove basePath from the path
    let pathWithoutBasepath = pathWithoutQs;
    if (this._basePath) {
      pathWithoutBasepath = pathWithoutQs.replace(`/${this._basePath}/`, '');
    }

    for (const index in this._routeDefs) {
      const routeDef = this._routeDefs[index];
      const matched = routeDef.regexp.exec(pathWithoutBasepath);
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

    const triggersEnter = this._triggersEnter.concat(route._triggersEnter);
    const redirectArgs = this._runTriggers(triggersEnter, context);

    if (redirectArgs) {
      return this.go(...redirectArgs);
    }

    // Set the current context
    this._current = context;

    const useReplaceState = this.env.replaceState.get();
    if (useReplaceState) {
      history.replaceState({}, window.title, path);
    } else {
      history.pushState({}, window.title, path);
    }

    const oldRoute = this._oldRoute;
    this._oldRoute = route;

    // Run exit handlers
    if (oldRoute) {
      const triggersExit = this._triggersExit.concat(oldRoute._triggersExit);
      const exitRedirectArgs = this._runTriggers(triggersExit, context);

      if (exitRedirectArgs) {
        return this.go(...exitRedirectArgs);
      }
    }

    this._applyRoute();
  }

  _applyRoute() {
    const currentContext = this._current;
    const route = currentContext.route;

    // otherwise, computations inside action will trigger to re-run
    // this computation. which we do not need.
    Tracker.nonreactive(() => {
      route.callAction(currentContext);

      Tracker.afterFlush(() => {
        this._onEveryPath.changed();
        this._updateReactiveDict(this._params, currentContext.params);
        this._updateReactiveDict(this._queryParams, currentContext.queryParams);
      });
    });
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

  _runTriggers(triggers, context) {
    let redirectArgs;
    const redirectFn = (...args) => {
      redirectArgs = args;
    };

    Triggers.runTriggers(
      triggers,
      context,
      redirectFn,
      () => {}
    );

    return redirectArgs;
  }

  _updateReactiveDict(dict, newValues) {
    const currentKeys = _.keys(newValues);
    const oldKeys = _.keys(dict.keyDeps);

    // set new values
    currentKeys.forEach((key) => {
      dict.set(key, newValues[key]);
    });

    // remove keys which does not exisits here
    const removedKeys = _.difference(oldKeys, currentKeys);
    removedKeys.forEach((key) => {
      dict.set(key, undefined);
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

  // This is required for implementing a router class.
  _getCurrentRouteContext() {
    return this._current;
  }

  _initClickAnchorHandlers() {
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
