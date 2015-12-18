SharedGroup = class {
  constructor(router, options, parent) {
    options = options || {};

    if (options.prefix && !/^\/.*/.test(options.prefix)) {
      const message = "group's prefix must start with '/'";
      throw new Error(message);
    }

    this.prefix = options.prefix || '';
    this.options = options;
    this._router = router;
    this.parent = parent;
  }

  route(pathDef, options, group) {
    options = options || {};

    if (!/^\/.*/.test(pathDef)) {
      const message = "route's path must start with '/'";
      throw new Error(message);
    }

    pathDef = this.prefix + pathDef;

    group = group || this;

    return this._router.route(pathDef, options, group);
  }

  group(options) {
    return new Group(this._router, options, this);
  }
};
