Router = class extends SharedRouter {
  constructor() {
    super();

    this.subscriptions = Function.prototype;
    this.ssrContext = new Meteor.EnvironmentVariable();
    this.inSubscription = new Meteor.EnvironmentVariable();
    this.routeContext = new Meteor.EnvironmentVariable();

    // FlowRouter can defer the script loading after rendered the body
    // It's turned off by default
    this.deferScriptLoading = false;

    // FlowRouter can cache it's pages to improve SSR performance.
    // It's turned off by default
    this.pageCacheTimeout = 0;

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
    this.pageCacheTimeout = timeout;
  }

  _getCurrentRouteContext() {
    return this.routeContext.get();
  }
};
