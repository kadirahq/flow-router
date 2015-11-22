const Qs = Npm.require('qs');

Router = class extends SharedRouter {
  constructor() {
    super();

    this.subscriptions = Function.prototype;
    this.ssrContext = new Meteor.EnvironmentVariable();
    this.inSubscription = new Meteor.EnvironmentVariable();
    // XXX this should actually be public since it's used by Route (remove _ from name)
    this._current = new Meteor.EnvironmentVariable();
    this.pageCacheTimeout = 1000 * 30;
  
    this.triggers = {
      enter: function() {
        // client only
      },
      exit: function() {
        // client only
      }
    }
  }
  
  route(pathDef, options) {
    return super.route(pathDef, options);
  }
    
  path(pathDef, fields, queryParams) {
    return super.path(pathDef, fields, queryParams);
  }


  
  getParam(key) {
    const current = this.current();
    if(current) {
      return current.params[key];
    }
  }
  
  getQueryParam(key) {
    const current = this.current();
    if(current) {
      return current.queryParams[key];
    }
  }
  
  getRouteName() {
    const current = this.current();
    if(current) {
      return current.route.name;
    }
  }
  
  watchPathChange() {
  
  }
  
  setDeferScriptLoading(defer) {
    this.deferScriptLoading = defer;
  }
  
  setPageCacheTimeout(timeout) {
    this._pageCacheTimeout = timeout;
  }
}
