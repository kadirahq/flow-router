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

    const innerRoute = new Route(this, pathDef, options, group);
    innerRoute._init();

    this._routes.push(innerRoute);


    if (options.name) {
      this._routesMap[options.name] = innerRoute;
    }

    this._triggerRouteRegister(innerRoute);

    return innerRoute;
  }

  // XXX this function needs to be cleaned up if possible by removing `if (this.isServer)`
  // and `if (this.isClient)` if possible
  path(pathDef, fields = {}, queryParams = {}) {
    if (this._routesMap[pathDef]) {
      pathDef = this._routesMap[pathDef].path;
    }

    let innerPath = '';

    // Prefix the path with the router global prefix
    if (this._basePath) {
      innerPath += `/${this._basePath}/`;
    }

    // Encode query params
    queryParams = this._encodeValues(queryParams);

    const toPath = PathToRegexp.compile(pathDef);
    innerPath += toPath(fields);

    // If we have one optional parameter in innerPath definition e.g.
    // /:category?
    // and the parameter isn't present, innerPath will be an empty string.
    // We have this check as a value for innerPath is required by e.g. FlowRouter.go()
    if (!innerPath) {
      innerPath = '/';
    }

    // Replace multiple slashes with single slash
    innerPath = innerPath.replace(/\/\/+/g, '/');

    // remove trailing slash
    // but keep the root slash if it's the only one
    innerPath = innerPath.match(/^\/{1}$/) ? innerPath : innerPath.replace(/\/$/, '');

    // explictly asked to add a trailing slash
    if (this.env.trailingSlash.get() && _.last(innerPath) !== '/') {
      innerPath += '/';
    }

    const strQueryParams = Qs.stringify(queryParams || {});

    if (strQueryParams) {
      innerPath += `?${strQueryParams}`;
    }

    return innerPath;
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
    const innerCurrent = _.clone(this._getCurrentRouteContext());

    innerCurrent.queryParams = EJSON.clone(innerCurrent.queryParams);
    innerCurrent.params = EJSON.clone(innerCurrent.params);

    return innerCurrent;
  }

  onRouteRegister(cb) {
    this._onRouteCallbacks.push(cb);
  }

  _encodeValues(obj) {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      newObj[key] = typeof value !== 'undefined' ? encodeURIComponent(value) : value;
    });

    return newObj;
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
