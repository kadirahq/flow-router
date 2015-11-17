"use strict";

window.Route = class {
  constructor(router, pathDef, options, group) {
    options = options || {};

    this.options = options;
    this.pathDef = pathDef

    // Route.path is deprecated and will be removed in 3.0
    this.path = pathDef;

    if (options.name) {
      this.name = options.name;
    }

    this._action = options.action || Function.prototype;
    this._triggersEnter = options.triggersEnter || [];
    this._triggersExit = options.triggersExit || [];
    this._router = router;

    this._params = new ReactiveDict();
    this._queryParams = new ReactiveDict();
    this._routeCloseDep = new Tracker.Dependency();

    // tracks the changes in the URL
    this._pathChangeDep = new Tracker.Dependency();

    this.group = group;
  }

  callAction(current) {
    this._action(current.params, current.queryParams);
  }

  getRouteName() {
    this._routeCloseDep.depend();
    return this.name;
  }

  getParam(key) {
    this._routeCloseDep.depend();
    return this._params.get(key);
  }

  getQueryParam(key) {
    this._routeCloseDep.depend();
    return this._queryParams.get(key);
  }

  watchPathChange() {
    this._pathChangeDep.depend();
  }

  registerRouteClose() {
    this._params = new ReactiveDict();
    this._queryParams = new ReactiveDict();
    this._routeCloseDep.changed();
    this._pathChangeDep.changed();
  }

  registerRouteClose() {
    this._params = new ReactiveDict();
    this._queryParams = new ReactiveDict();
    this._routeCloseDep.changed();
    this._pathChangeDep.changed();
  }

  registerRouteChange(currentContext, routeChanging) {
    // register params
    const params = currentContext.params;
    this._updateReactiveDict(this._params, params);

    // register query params
    const queryParams = currentContext.queryParams;
    this._updateReactiveDict(this._queryParams, queryParams);

    // if the route is changing, we need to defer triggering path changing
    // if we did this, old route's path watchers will detect this
    // Real issue is, above watcher will get removed with the new route
    // So, we don't need to trigger it now
    // We are doing it on the route close event. So, if they exists they'll 
    // get notify that
    if(!routeChanging) {
      this._pathChangeDep.changed();
    }
  }

  _updateReactiveDict(dict, newValues) {
    const currentKeys = _.keys(newValues);
    const oldKeys = _.keys(dict.keyDeps);

    // set new values
    //  params is an array. So, _.each(params) does not works
    //  to iterate params
    _.each(currentKeys, (key) => {
      dict.set(key, newValues[key]);
    });

    // remove keys which does not exisits here
    const removedKeys = _.difference(oldKeys, currentKeys);
    _.each(removedKeys, (key) => {
      dict.set(key, undefined);
    });
  }
}