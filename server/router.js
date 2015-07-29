var Qs = Npm.require('qs');

Router = function () {
  this._routes = [];
  this._routesMap = {};
  this.subscriptions = Function.prototype;
  this.ssrContext = new Meteor.EnvironmentVariable();
  this.inSubscription = new Meteor.EnvironmentVariable();
  this.currentRoute = new Meteor.EnvironmentVariable();
  this.pageCacheTimeout = 1000 * 30;
};

Router.prototype.setPageCacheTimeout = function(timeout) {
  this._pageCacheTimeout = timeout;
};

Router.prototype.route = function(path, options) {
  if (!/^\/.*/.test(path)) {
    var message = "route's path must start with '/'";
    throw new Error(message);
  }
  
  options = options || {};
  var route = new Route(this, path, options);
  this._routes.push(route);

  if (options.name) {
    this._routesMap[options.name] = route;
  }

  return route;
};

Router.prototype.group = function(options) {
  return new Group(this, options);
};

Router.prototype.path = function(pathDef, fields, queryParams) {
  if (this._routesMap[pathDef]) {
    pathDef = this._routesMap[pathDef].path;
  }

  fields = fields || {};
  var regExp = /(:[\w\(\)\\\+\*\.\?]+)+/g;
  var path = pathDef.replace(regExp, function(key) {
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


Router.prototype.go = function() {
  // client only
};

Router.prototype.current = function() {
  return this.currentRoute.get();
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
