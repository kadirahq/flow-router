Group = class {
  constructor(router, options, parent) {
    options = options || {};

    if (options.prefix && !/^\/.*/.test(options.prefix)) {
      const message = "group's prefix must start with '/'";
      throw new Error(message);
    }

    this._router = router;
    this.prefix = options.prefix || '';
    this.name = options.name;
    this.options = options;

    this._triggersEnter = options.triggersEnter || [];
    this._triggersExit = options.triggersExit || [];
    this._subscriptions = options.subscriptions || Function.prototype;

    this.parent = parent;
    if (this.parent) {
      this.prefix = parent.prefix + this.prefix;

      this._triggersEnter = parent._triggersEnter.concat(this._triggersEnter);
      this._triggersExit = this._triggersExit.concat(parent._triggersExit);
    }
  }

  route(pathDef, options, group) {
    options = options || {};

    if (!/^\/.*/.test(pathDef)) {
      const message = "route's path must start with '/'";
      throw new Error(message);
    }

    group = group || this;
    pathDef = this.prefix + pathDef;

    const triggersEnter = options.triggersEnter || [];
    options.triggersEnter = this._triggersEnter.concat(triggersEnter);

    const triggersExit = options.triggersExit || [];
    options.triggersExit = triggersExit.concat(this._triggersExit);

    return this._router.route(pathDef, options, group);
  }

  group(options) {
    return new Group(this._router, options, this);
  }

  callSubscriptions(current) {
    if (this.parent) {
      this.parent.callSubscriptions(current);
    }

    this._subscriptions.call(current.route, current.params, current.queryParams);
  }
}