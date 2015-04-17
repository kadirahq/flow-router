Group = function(router, options, parent) {
  options = options || {};

  if (options.prefix && !/^\/.*/.test(options.prefix)) {
    var message = "group's prefix must start with '/'";
    throw new Error(message);
  }

  this._router = router;
  this.prefix = options.prefix || '';

  this._middlewares = options.middlewares || [];
  this._subscriptions = options.subscriptions || Function.prototype;

  this.parent = parent;
  if (this.parent) {
    this.prefix = parent.prefix + this.prefix;
    this._middlewares = parent._middlewares.concat(this._middlewares);
  }
};

Group.prototype.route = function(path, options, group) {
  options = options || {};

  if (!/^\/.*/.test(path)) {
    var message = "route's path must start with '/'";
    throw new Error(message);
  }

  group = group || this;
  path = this.prefix + path;

  var middlewares = options.middlewares || [];
  options.middlewares = this._middlewares.concat(middlewares);

  return this._router.route(path, options, group);
};

Group.prototype.group = function(options) {
  return new Group(this._router, options, this);
};

Group.prototype.callSubscriptions = function(current) {
  if (this.parent) {
    this.parent.callSubscriptions(current);
  }

  this._subscriptions.call(current.route, current.params, current.queryParams);
};
