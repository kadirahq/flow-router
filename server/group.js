Group = class {
  constructor(router, options) {
    options = options || {};
    this.prefix = options.prefix || '';
    this.options = options;
    this._router = router;
  }

  route(pathDef, options) {
    pathDef = this.prefix + pathDef;
    return this._router.route(pathDef, options);
  }
  
  group(options) {
    const group = new Group(this._router, options);
    group.parent = this;
  
    return group;
  }
}
