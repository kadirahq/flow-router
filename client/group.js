Group = class extends SharedGroup {
  constructor(router, options, parent) {
    super(router, options, parent);

    options = options || {};

    this.name = options.name;

    this._triggersEnter = options.triggersEnter || [];
    this._triggersExit = options.triggersExit || [];
    this._subscriptions = options.subscriptions || Function.prototype;

    if (this.parent) {
      this.prefix = parent.prefix + this.prefix;

      this._triggersEnter = parent._triggersEnter.concat(this._triggersEnter);
      this._triggersExit = this._triggersExit.concat(parent._triggersExit);
    }
  }

  route(pathDef, options, group) {
    options = options || {};

    const triggersEnter = options.triggersEnter || [];
    options.triggersEnter = this._triggersEnter.concat(triggersEnter);

    const triggersExit = options.triggersExit || [];
    options.triggersExit = triggersExit.concat(this._triggersExit);

    return super.route(pathDef, options, group);
  }

  callSubscriptions(current) {
    if (this.parent) {
      this.parent.callSubscriptions(current);
    }

    this._subscriptions.call(current.route, current.params, current.queryParams);
  }
};
