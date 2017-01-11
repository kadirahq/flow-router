Group = function(router, options, parent) {
  options = options || {};

  if (options.prefix && !/^\/.*/.test(options.prefix)) {
    var message = "group's prefix must start with '/'";
    throw new Error(message);
  }

  this._router = router;
  this.prefix = options.prefix || '';
  this.name = options.name;
  this.options = options;

  this.parent = parent;
  if (this.parent) {
    this.prefix = parent.prefix + this.prefix;
  }
};

Group.prototype.route = function(pathDef, options) {
  pathDef = this.prefix + pathDef;
  return this._router.route(pathDef, options);
};

Group.prototype.group = function(options) {
  return new Group(this._router, options, this);
};
