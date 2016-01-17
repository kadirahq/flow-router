Route = class extends SharedRoute {
  constructor(router, pathDef, options, group) {
    super(router, pathDef, options, group);

    options = options || {};

    this._triggersEnter = options.triggersEnter || [];
    this._triggersExit = options.triggersExit || [];
  }

  // This is a required method for the route. It's crucial to
  // have a dummy method even we don't need it.
  _init() {

  }

  callAction(current) {
    this._action(current.params, current.queryParams);
  }
};
