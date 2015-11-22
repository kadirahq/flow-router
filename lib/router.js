// XXX clean up the bits of the code where we use `if (Meteor.isServer)` if possible.
// doesn't seem very clean

let Qs;

if (Meteor.isServer) {
  Qs = Npm.require('qs');
}

SharedRouter = class {
  constructor() {
    this._routes = [];
    this._routesMap = {};

    // holds onRoute callbacks
    this._onRouteCallbacks = [];
  }

  route(pathDef, options, group) {
    if (!/^\/.*/.test(pathDef)) {
      const message = "route's path must start with '/'";
      throw new Error(message);
    }
    
    options = options || {};

    const route = new Route(this, pathDef, options, group);

    this._routes.push(route);


    if (options.name) {
      this._routesMap[options.name] = route;
    }
  
    this._triggerRouteRegister(route);

    return route;
  }

  path(pathDef, fields, queryParams) {
    if (this._routesMap[pathDef]) {
      pathDef = this._routesMap[pathDef].path;
    }

    let path = "";
  
    if (Meteor.isServer) {
      path = FlowRouter.basePath;
    } else {
      // Prefix the path with the router global prefix
      if (this._basePath) {
        path += "/" + this._basePath + "/";
      }
    }
  
    fields = fields || {};
    const regExp = /(:[\w\(\)\\\+\*\.\?]+)+/g;
    path += pathDef.replace(regExp, (key) => {
      const firstRegexpChar = key.indexOf("(");
      // get the content behind : and (\\d+/)
      key = key.substring(1, (firstRegexpChar > 0) ? firstRegexpChar : undefined);
      // remove +?*
      key = key.replace(/[\+\*\?]+/g, "");
  
      if (Meteor.isServer) {
        return fields[key] || "";
      } else {
        // this is to allow page js to keep the custom characters as it is
        // we need to encode 2 times otherwise "/" char does not work properly
        // So, in that case, when I includes "/" it will think it's a part of the
        // route. encoding 2times fixes it
        return encodeURIComponent(encodeURIComponent(fields[key] || ""));
      }
    });
  
    // Replace multiple slashes with single slash
    path = path.replace(/\/\/+/g, "/");
  
    // remove trailing slash
    // but keep the root slash if it's the only one
    path = path.match(/^\/{1}$/) ? path : path.replace(/\/$/, "");
  
    if (Meteor.isClient) {
      // explictly asked to add a trailing slash
      if (this.env.trailingSlash.get() && _.last(path) !== "/") {
        path += "/";
      } 
    }
  
    let strQueryParams;

    if (Meteor.isServer) {
      strQueryParams = Qs.stringify(queryParams || {});
    } else {
      strQueryParams = this._qs.stringify(queryParams || {});
    }

    if (strQueryParams) {
      path += "?" + strQueryParams;
    }
  
    return path;
  }

  go() {
    // client only
  }

  group(options) {
    return new Group(this, options);
  }

  url() {
    var path = this.path.apply(this, arguments);
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
    const current = _.clone(this._current);
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
      'triggersEnter', 'triggersExit', 'action', 'name'
    ];
    routePublicApi.options = _.omit(currentRoute.options, omittingOptionFields);
  
    this._onRouteCallbacks.forEach((cb) => {
      cb(routePublicApi);
    });
  }
}