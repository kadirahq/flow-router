const Qs = Npm.require('qs');

Router = class {
  constructor() {
    this._routes = [];
    this._routesMap = {};
    this.subscriptions = Function.prototype;
    this.ssrContext = new Meteor.EnvironmentVariable();
    this.inSubscription = new Meteor.EnvironmentVariable();
    this.routeContext = new Meteor.EnvironmentVariable();
    this.pageCacheTimeout = 1000 * 30;

    // holds onRoute callbacks
    this._onRouteCallbacks = [];
  }

  route(pathDef, options) {
    if (!/^\/.*/.test(pathDef)) {
      const message = "route's path must start with '/'";
      throw new Error(message);
    }

    options = options || {};
    const route = new Route(this, pathDef, options);
    route.init();
    this._routes.push(route);

    if (options.name) {
      this._routesMap[options.name] = route;
    }

    this._triggerRouteRegister(route);

    return route;
  }

  group(options) {
    return new Group(this, options);
  }

  path(pathDef, fields, queryParams) {
    if(this._routesMap[pathDef]) {
      pathDef = this._routesMap[pathDef].path;
    }

    let path = FlowRouter.basePath;

    fields = fields || {};
    const regExp = /(:[\w\(\)\\\+\*\.\?]+)+/g;
    path += pathDef.replace(regExp, function(key) {
      const firstRegexpChar = key.indexOf("(");
      // get the content behind : and (\\d+/)
      key = key.substring(1, (firstRegexpChar > 0) ? firstRegexpChar : undefined);
      // remove +?*
      key = key.replace(/[\+\*\?]+/g, "");

      return fields[key] || "";
    });

    path = path.replace(/\/\/+/g, "/"); // Replace multiple slashes with single slash

    // remove trailing slash
    // but keep the root slash if it's the only one
    path = path.match(/^\/{1}$/) ? path: path.replace(/\/$/, "");

    const strQueryParams = Qs.stringify(queryParams || {});
    if(strQueryParams) {
      path += "?" + strQueryParams;
    }

    return path;
  }

  onRouteRegister(cb) {
    this._onRouteCallbacks.push(cb);
  }

  _triggerRouteRegister(currentRoute) {
    // We should only need to send a safe set of fields on the route
    // object.
    // This is not to hide what's inside the route object, but to show
    // these are the public APIs
    const routePublicApi = _.pick(currentRoute, 'name', 'pathDef', 'path');
    const omittingOptionFields = [
      'triggersEnter', 'triggersExit', 'action', 'subscriptions', 'name'
    ];
    routePublicApi.options = _.omit(currentRoute.options, omittingOptionFields);

    this._onRouteCallbacks.forEach((cb) => {
      cb(routePublicApi);
    });
  }

  url() {
    const path = this.path.apply(this, arguments);
    return Meteor.absoluteUrl(path.replace(/^\//, ''));
  }

  go() {
    // client only
  }

  current() {
    // We can't trust outside, that's why we clone this
    // Anyway, we can't clone the whole object since it has non-jsonable values
    // That's why we clone what's really needed.
    const current = _.clone(this.routeContext.get());
    current.queryParams = EJSON.clone(current.queryParams);
    current.params = EJSON.clone(current.params);
    return current;
  }

  getParam(key) {
    const current = this.current();
    if(current) {
      return current.params[key];
    }
  }

  getQueryParam(key) {
    const current = this.current();
    if(current) {
      return current.queryParams[key];
    }
  }

  getRouteName() {
    const current = this.current();
    if(current) {
      return current.route.name;
    }
  }

  watchPathChange() {

  }

  setDeferScriptLoading(defer) {
    this.deferScriptLoading = defer;
  }

  setPageCacheTimeout(timeout) {
    this._pageCacheTimeout = timeout;
  }
}

// Move this into the class declaration if possible.
// Is there a reason this isn't in the constructor?
Router.prototype.triggers = {
  enter: function() {
    // client only
  },
  exit: function() {
    // client only
  }
};
