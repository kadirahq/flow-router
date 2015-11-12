var Qs = Npm.require('qs');

Router = function () {
  this._routes = [];
  this._routesMap = {};
  this.subscriptions = Function.prototype;
  this.ssrContext = new Meteor.EnvironmentVariable();
  this.inSubscription = new Meteor.EnvironmentVariable();
  this.currentRoute = new Meteor.EnvironmentVariable();
  this.pageCacheTimeout = 1000 * 30;

  // holds onRoute callbacks
  this._onRouteCallbacks = [];
};

Router.prototype.route = function(pathDef, options) {
  if (!/^\/.*/.test(pathDef)) {
    var message = "route's path must start with '/'";
    throw new Error(message);
  }
  
  options = options || {};
  var route = new Route(this, pathDef, options);
  this._routes.push(route);

  if (options.name) {
    this._routesMap[options.name] = route;
  }

  this._triggerRouteRegister(route);
  return route;
};

Router.prototype.group = function(options) {
  return new Group(this, options);
};

Router.prototype.path = function(pathDef, fields, queryParams) {
  if(this._routesMap[pathDef]) {
    pathDef = this._routesMap[pathDef].path;
  }

  var path = FlowRouter.basePath;

  fields = fields || {};
  var regExp = /(:[\w\(\)\\\+\*\.\?]+)+/g;
  path += pathDef.replace(regExp, function(key) {
    var firstRegexpChar = key.indexOf("(");
    // get the content behind : and (\\d+/)
    key = key.substring(1, (firstRegexpChar > 0)? firstRegexpChar: undefined);
    // remove +?*
    key = key.replace(/[\+\*\?]+/g, "");

    return fields[key] || "";
  });

  path = path.replace(/\/\/+/g, "/"); // Replace multiple slashes with single slash

  // remove trailing slash
  // but keep the root slash if it's the only one
  path = path.match(/^\/{1}$/) ? path: path.replace(/\/$/, "");

  var strQueryParams = Qs.stringify(queryParams || {});
  if(strQueryParams) {
    path += "?" + strQueryParams;
  }

  return path;
};

Router.prototype.onRouteRegister = function(cb) {
  this._onRouteCallbacks.push(cb);
};

Router.prototype._triggerRouteRegister = function(currentRoute) {
  // We should only need to send a safe set of fields on the route
  // object.
  // This is not to hide what's inside the route object, but to show 
  // these are the public APIs
  var routePublicApi = _.pick(currentRoute, 'name', 'pathDef', 'path');
  var omittingOptionFields = [
    'triggersEnter', 'triggersExit', 'action', 'subscriptions', 'name'
  ];
  routePublicApi.options = _.omit(currentRoute.options, omittingOptionFields);

  _.each(this._onRouteCallbacks, function(cb) {
    cb(routePublicApi);
  });
};

Router.prototype.url = function() {
  var path = this.path.apply(this, arguments);
  return Meteor.absoluteUrl(path.replace(/^\//, ''));
};

Router.prototype.go = function() {
  // client only
};

Router.prototype.current = function() {
  // We can't trust outside, that's why we clone this
  // Anyway, we can't clone the whole object since it has non-jsonable values
  // That's why we clone what's really needed.
  var current = _.clone(this.currentRoute.get());
  current.queryParams = EJSON.clone(current.queryParams);
  current.params = EJSON.clone(current.params);
  return current;
};

Router.prototype.getParam = function(key) {
  var current = this.current();
  if(current) {
    return current.params[key];
  }
};

Router.prototype.getQueryParam = function(key) {
  var current = this.current();
  if(current) {
    return current.queryParams[key];
  }
};

Router.prototype.getRouteName = function() {
  var current = this.current();
  if(current) {
    return current.route.name;
  }
};

Router.prototype.triggers = {
  enter: function() {
    // client only
  },
  exit: function() {
    // client only
  }
};

Router.prototype.ready = function() {
  // client only
};

Router.prototype.initialize = function() {
  // client only
};

Router.prototype.wait = function() {
  // client only
};

Router.prototype.watchPathChange = function () {

};

Router.prototype.setDeferScriptLoading = function(defer) {
  this.deferScriptLoading = defer;
};

Router.prototype.setPageCacheTimeout = function(timeout) {
  this._pageCacheTimeout = timeout;
};