import Qs from 'qs';
import PathToRegexp from 'path-to-regexp';

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

    const currentRoute = new Route(this, pathDef, options, group);
    currentRoute._init();

    this._routes.push(currentRoute);


    if (options.name) {
      this._routesMap[options.name] = currentRoute;
    }

    this._triggerRouteRegister(currentRoute);

    return currentRoute;
  }

  // XXX this function needs to be cleaned up if possible by removing `if (this.isServer)`
  // and `if (this.isClient)` if possible
  path(pathDef, fields = {}, queryParams = {}) {
    if (this._routesMap[pathDef]) {
      pathDef = this._routesMap[pathDef].path;
    }

    let newPath = '';

    // Prefix the path with the router global prefix
    if (this._basePath) {
      newPath += `/${this._basePath}/`;
    }

    // Encode query params
    queryParams = this._encodeValues(queryParams);

    const toPath = PathToRegexp.compile(pathDef);
    newPath += toPath(fields);

    // If we have one optional parameter in path definition e.g.
    // /:category?
    // and the parameter isn't present, path will be an empty string.
    // We have this check as a value for path is required by e.g. FlowRouter.go()
    if (!newPath) {
      newPath = '/';
    }

    // Replace multiple slashes with single slash
    newPath = newPath.replace(/\/\/+/g, '/');

    // remove trailing slash
    // but keep the root slash if it's the only one
    newPath = newPath.match(/^\/{1}$/) ? newPath : newPath.replace(/\/$/, '');

    // explictly asked to add a trailing slash
    if (this.env.trailingSlash.get() && _.last(newPath) !== '/') {
      newPath += '/';
    }

    const strQueryParams = Qs.stringify(queryParams || {});

    if (strQueryParams) {
      newPath += `?${strQueryParams}`;
    }

    return newPath;
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

  url(...args) {
    // We need to remove the leading base path, or "/", as it will be inserted
    // automatically by `Meteor.absoluteUrl` as documented in:
    // http://docs.meteor.com/#/full/meteor_absoluteurl
    const completePath = this.path(...args);
    const basePath = this._basePath || '/';
    const pathWithoutBase = completePath.replace(RegExp(`^${basePath}`), '');
    return Meteor.absoluteUrl(pathWithoutBase);
  }

  // For client:
  // .current is not reactive on the client
  // This is by design. use .getParam() instead
  // If you really need to watch the path change, use .watchPathChange()
  current() {
    // We can't trust outside, that's why we clone this
    // Anyway, we can't clone the whole object since it has non-jsonable values
    // That's why we clone what's really needed.
    const context = _.clone(this._getCurrentRouteContext());

    context.queryParams = EJSON.clone(context.queryParams);
    context.params = EJSON.clone(context.params);

    return context;
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
