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
