FlowRoute = function (path, options) {
  this.path = path;
  this.render = options.render || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._middleware = [];
  this._subsMap = {};
};


FlowRoute.prototype.middleware = function (middleware) {
  this._middleware.push(middleware);
};


FlowRoute.prototype.subscribe = function (name, sub, options) {
  options = _.extend(this._getDefaultSubOptions(), options);
  if(options.server) {
    this._subsMap[name] = sub;
  }
};


FlowRoute.prototype._getDefaultSubOptions = function() {
  return {
    server: true,
    client: true,
  }
}
