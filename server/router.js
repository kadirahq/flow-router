Router = function () {
  this._routesMap = {};
  this.subscriptions = Function.prototype;
};


Router.prototype.route = function(path, options) {
  this._routesMap[path] = new Route(this, path, options);
  return this._routesMap[path];
};

Router.prototype.group = function(options) {
  return new Group(this, options);
};


Router.prototype.go = function() {
  // client only
};


Router.prototype.current = function() {
  // client only
};


Router.prototype.middleware = function() {
  // client only
};


Router.prototype.getState = function() {
  // client only
};


Router.prototype.getAllStates = function() {
  // client only
};


Router.prototype.setState = function() {
  // client only
};


Router.prototype.removeState = function() {
  // client only
};


Router.prototype.clearStates = function() {
  // client only
};


Router.prototype.ready = function() {
  // client only
};


Router.prototype.initialize = function() {
  // client only
};
