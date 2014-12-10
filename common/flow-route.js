FlowRoute = function (path, options) {
  this.path = path;
  this.render = options.render || Function.prototype;
  this.subscriptions = options.subscriptions || Function.prototype;
  this._middleware = [];
  this._subsMap = {};

  if(Meteor.isClient) {
    this._states = {};
    this._clientRouter.route(path, options);
  }
};


FlowRoute.prototype.middleware = function (middleware) {
  this._middleware.push(middleware);

  if(Meteor.isClient) {
    this._clientRouter.middleware(middleware, {
      path: this.path,
    });
  }
};


FlowRoute.prototype.subscribe = function (name, sub, options) {
  options = _.extend(this._getDefaultSubOptions(), options);
  if((Meteor.isClient && options.client)
  || (Meteor.isServer && options.server)) {
    this._subsMap[name] = sub;
  }
};


FlowRoute.prototype._getDefaultSubOptions = function() {
  return {
    server: true,
    client: true,
  };
};


if(Meteor.isClient) {
  FlowRoute.prototype._clientRouter = ClientRouter;


  FlowRoute.prototype.setState = function (name, value, options) {
    this._states[name] = value;
    this._clientRouter.setState(name, value, options)
  };


  FlowRoute.prototype.getState = function (name) {
    return this._states[name];
  };


  FlowRoute.prototype.getStates = function () {
    return this._states;
  };
}
