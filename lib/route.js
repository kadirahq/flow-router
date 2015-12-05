SharedRoute = class {
  constructor(router, pathDef, options, group) {
    options = options || {};

    this.options = options;

    this.name = options.name;

    this.pathDef = pathDef;

    // Route.path is deprecated and will be removed in 3.0
    this.path = this.pathDef;

    this._router = router;

    this._action = options.action || Function.prototype;

    this.group = group;
  }
};
