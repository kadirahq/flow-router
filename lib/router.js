SharedRouter = class {
  constructor() {
    this._routes = [];
    this._routesMap = {};

    // holds onRoute callbacks
    this._onRouteCallbacks = [];

    this.env = {};
    this.env.trailingSlash = new Meteor.EnvironmentVariable();
  }

  route(pathDef, options, group) {
    if (!/^\/.*/.test(pathDef)) {
      const message = "route's path must start with '/'";
      throw new Error(message);
    }

    options = options || {};

    const route = new Route(this, pathDef, options, group);
    route._init();

    this._routes.push(route);


    if (options.name) {
      this._routesMap[options.name] = route;
    }

    this._triggerRouteRegister(route);

    return route;
  }

  // XXX this function needs to be cleaned up if possible by removing `if (this.isServer)`
  // and `if (this.isClient)` if possible
  path(pathDef, fields, queryParams) {
    if (this._routesMap[pathDef]) {
      pathDef = this._routesMap[pathDef].path;
    }

    let path = '';

    // Prefix the path with the router global prefix
    if (this._basePath) {
      path += `/${this._basePath}/`;
    }

    fields = fields || {};

    fields = fields || {};
    const toPath = PathToRegexp.compile(pathDef);
    path += toPath(fields);

    // If we have one optional parameter in path definition e.g.
    // /:category?
    // and the parameter isn't present, path will be an empty string.
    // We have this check as a value for path is required by e.g. FlowRouter.go()
    if (!path) {
      path = '/';
    }

    // Replace multiple slashes with single slash
    path = path.replace(/\/\/+/g, '/');

    // remove trailing slash
    // but keep the root slash if it's the only one
    path = path.match(/^\/{1}$/) ? path : path.replace(/\/$/, '');

    // explictly asked to add a trailing slash
    if (this.env.trailingSlash.get() && _.last(path) !== '/') {
      path += '/';
    }

    const strQueryParams = Qs.stringify(queryParams || {});

    if (strQueryParams) {
      path += `?${strQueryParams}`;
    }

    return path;
  }

  go() {
    // client only
  }

  watchPathChange() {
    // client only
  }

  group(options) {
    return new Group(this, options);
  }

  url() {
    const path = this.path(...arguments);
    return Meteor.absoluteUrl(path.replace(/^\//, ''));
  }

  // For client:
  // .current is not reactive on the client
  // This is by design. use .getParam() instead
  // If you really need to watch the path change, use .watchPathChange()
  current() {
    // We can't trust outside, that's why we clone this
    // Anyway, we can't clone the whole object since it has non-jsonable values
    // That's why we clone what's really needed.
    const current = _.clone(this._getCurrentRouteContext());

    current.queryParams = EJSON.clone(current.queryParams);
    current.params = EJSON.clone(current.params);

    return current;
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
      'triggersEnter', 'triggersExit', 'name', 'action'
    ];
    routePublicApi.options = _.omit(currentRoute.options, omittingOptionFields);

    this._onRouteCallbacks.forEach((cb) => {
      cb(routePublicApi);
    });
  }

  _getCurrentRouteContext() {
    throw new Error('Not implemented');
  }

  _init() {
    throw new Error('Not implemented');
  }

  withTrailingSlash(fn) {
    return this.env.trailingSlash.withValue(true, fn);
  }
};
