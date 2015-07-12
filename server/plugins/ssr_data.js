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
  return {ready: function () {return true}};
};

var Mongo = Package['mongo'].Mongo;
var originalFind = Mongo.Collection.prototype.find;
Mongo.Collection.prototype.find = function(selector, options) {
  console.log("fetching data", selector);
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

var originalAutorun = Tracker.autorun;
Tracker.autorun = function (fn) {
  // if autorun is in the ssrContext, we need fake and run the callback 
  // in the same eventloop
  if(FlowRouter.ssrContext.get()) {
    var c = {firstRun: true, stop: function () {}};
    fn(c);
    return c;
  } else {
    return originalAutorun.call(Tracker, fn);
  }
};