const originalSubscribe = Meteor.subscribe;

Meteor.subscribe = function(pubName) {
  const params = Array.prototype.slice.call(arguments, 1);

  const ssrContext = FlowRouter.ssrContext.get();
  if (ssrContext) {
    FlowRouter.inSubscription.withValue(true, () => {
      ssrContext.addSubscription(pubName, params);
    });
  }

  if (originalSubscribe) {
    originalSubscribe.apply(this, arguments);
  }

  return {
    ready: () => true
  };
};

const Mongo = Package.mongo.Mongo;
const originalFind = Mongo.Collection.prototype.find;

Mongo.Collection.prototype.find = function(selector, options) {
  selector = selector || {};
  const ssrContext = FlowRouter.ssrContext.get();
  if (ssrContext && !FlowRouter.inSubscription.get()) {
    const collName = this._name;
    const collection = ssrContext.getCollection(collName);
    const cursor = collection.find(selector, options);
    return cursor;
  }

  return originalFind.call(this, selector, options);
};

// We must implement this. Otherwise, it'll call the origin prototype's
// find method
Mongo.Collection.prototype.findOne = function(selector, options) {
  options = options || {};
  options.limit = 1;
  return this.find(selector, options).fetch()[0];
};

const originalAutorun = Tracker.autorun;

Tracker.autorun = (fn) => {
  // if autorun is in the ssrContext, we need fake and run the callback
  // in the same eventloop
  if (FlowRouter.ssrContext.get()) {
    const c = { firstRun: true, stop: () => {} };
    fn(c);
    return c;
  }

  return originalAutorun.call(Tracker, fn);
};

// By default, Meteor[call,apply] also inherit SsrContext
// So, they can't access the full MongoDB dataset because of that
// Then, we need to remove the SsrContext within Method calls
['call', 'apply'].forEach((methodName) => {
  const original = Meteor[methodName];
  Meteor[methodName] = (...args) => {
    const response = FlowRouter.ssrContext.withValue(null, () => {
      return original.apply(this, args);
    });

    return response;
  };
});

// This is not available in the server. But to make it work with SSR
// We need to have it.
Meteor.loggingIn = () => {
  return false;
};
