Group = function(router, options) {
  options = options || {};
  this.prefix = options.prefix || '';

  this._router = router;
};

Group.prototype.route = function(path, options) {
  path = this.prefix + path;
  return this._router.route(path, options);
};

Group.prototype.group = function(options) {
  var group = new Group(this._router, options);
  group.parent = this;

  return group;
};
