var originalSubscribe = Meteor.subscribe;
Meteor.subscribe = function(pubName) {
  var params = Array.prototype.slice.call(arguments, 1);
  
  var ssrContext = FlowRouter.ssrContext.get();
  if(ssrContext) {
    FlowRouter.inSubscription.withValue(true, function() {
      ssrContext.addSubscription(pubName, params);
    });
  }

  if(originalSubscribe) {
    originalSubscribe.apply(this, arguments);
  }
};

var Mongo = Package['mongo'].Mongo;
var originalFind = Mongo.Collection.prototype.find;
Mongo.Collection.prototype.find = function(selector, options) {
  selector = selector || {};
  var collName = this._name;
  var ssrContext = FlowRouter.ssrContext.get();
  if(ssrContext && !FlowRouter.inSubscription.get()) {
    var collection = ssrContext.getCollection(collName);
    var cursor = collection.find(selector, options);
    return cursor;
  }

  return originalFind.call(this, selector, options);
};

Mongo.Collection.prototype.findOne = function(selector, options) {
  options = options || {};
  options.limit = 1;
  return this.find(selector, options).fetch()[0];  
};