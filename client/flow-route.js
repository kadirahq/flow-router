FlowRoute = function (path, options) {
  this._states = new ReactiveDict;
};


FlowRoute.prototype.setState = function (name, value, options) {
  this._states.set(name, value);
};


FlowRoute.prototype.getState = function (name) {
  this._states.get(name);
};
