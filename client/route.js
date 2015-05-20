Route = function(router, path, options, group) {
  options = options || {};

  this.path = path;
  if (options.name) {
    this.name = options.name;
  }

  this._action = options.action || Function.prototype;
  this._subscriptions = options.subscriptions || Function.prototype;
  this._middlewares = options.middlewares || [];
  this._subsMap = {};
  this._router = router;

  this._params = new ReactiveDict();
  this._queryParams = new ReactiveDict();
  this._routeChangeDep = new Tracker.Dependency();

  // tracks the changes in the URL
  this.pathChangeDep = new Tracker.Dependency();

  this.group = group;
};

Route.prototype.clearSubscriptions = function() {
  this._subsMap = {};
};

Route.prototype.register = function(name, sub, options) {
  this._subsMap[name] = sub;
};


Route.prototype.getSubscription = function(name) {
  return this._subsMap[name];
};


Route.prototype.getAllSubscriptions = function() {
  return this._subsMap;
};


Route.prototype._processMiddlewares = function(context, after) {
  var currentIndex = 0;
  var self = this;

  runMiddleware();
  function runMiddleware() {
    var fn = self._middlewares[currentIndex++];
    if(fn) {
      fn(context.path, function(redirectPath) {
        if(redirectPath) {
          return self._router.redirect(redirectPath);
        } else {
          runMiddleware();
        }
      });
    } else {
      after();
    }
  }
};

Route.prototype.callAction = function(current) {
  var self = this;
  self._processMiddlewares(current.context, function() {
    self._action(current.params, current.queryParams);
  });
};

Route.prototype.callSubscriptions = function(current) {
  this.clearSubscriptions();
  if (this.group) {
    this.group.callSubscriptions(current);
  }

  this._subscriptions(current.params, current.queryParams);
};

Route.prototype.getRouteName = function() {
  this._routeChangeDep.depend();
  return this.name;
};

Route.prototype.getParam = function(key) {
  this._routeChangeDep.depend();
  return this._params.get(key);
};

Route.prototype.getQueryParam = function(key) {
  this._routeChangeDep.depend();
  return this._queryParams.get(key);
};

Route.prototype.registerRouteClose = function() {
  this._params = new ReactiveDict();
  this._queryParams = new ReactiveDict();
  this._routeChangeDep.changed();
};

Route.prototype.registerRouteChange = function(fullRouteChange) {
  // register params
  var params = this._router._current.params;
  this._updateReactiveDict(this._params, params);

  // register query params
  var queryParams = this._router._current.queryParams;
  this._updateReactiveDict(this._queryParams, queryParams);
};

Route.prototype._updateReactiveDict = function(dict, newValues) {
  var currentKeys = _.keys(newValues);
  var oldKeys = _.keys(dict.keyDeps);

  // set new values
  //  params is an array. So, _.each(params) does not works
  //  to iterate params
  _.each(currentKeys, function(key) {
    dict.set(key, newValues[key]);
  });

  // remove keys which does not exisits here
  var removedKeys = _.difference(oldKeys, currentKeys);
  _.each(removedKeys, function(key) {
    dict.set(key, undefined);
  });
};