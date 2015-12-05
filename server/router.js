const Qs = Npm.require('qs');

Router = class extends SharedRouter {
  constructor() {
    super();

    this._qs = Qs;

    this.subscriptions = Function.prototype;
    this.ssrContext = new Meteor.EnvironmentVariable();
    this.inSubscription = new Meteor.EnvironmentVariable();
    this.routeContext = new Meteor.EnvironmentVariable();

    this.pageCacheTimeout = 1000 * 30;

    // holds onRoute callbacks
    this._onRouteCallbacks = [];

    this.triggers = {
      enter: function() {
        // client only
      },
      exit: function() {
        // client only
      }
    };
  }

  getParam(key) {
    const current = this.current();
    if (current) {
      return current.params[key];
    }
  }

  getQueryParam(key) {
    const current = this.current();
    if (current) {
      return current.queryParams[key];
    }
  }

  getRouteName() {
    const current = this.current();
    if (current) {
      return current.route.name;
    }
  }

  setDeferScriptLoading(defer) {
    this.deferScriptLoading = defer;
  }

  setPageCacheTimeout(timeout) {
    this._pageCacheTimeout = timeout;
  }

  _getCurrentRouteContext() {
    return this.routeContext.get();
  }
};
