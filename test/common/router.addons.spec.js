Router = FlowRouter.Router;

Tinytest.addAsync('Common - Addons - onRouteRegister basic usage', function (test, done) {
  var name = Random.id();
  var customField = Random.id();
  var path = '/' + name;
  
  FlowRouter.onRouteRegister(function(route) {
    test.equal(route, {
      path: path,
      name: name,
      options: {customField: customField, name: name}
    });  
    FlowRouter._onRouteCallbacks = [];
    done();
  });

  FlowRouter.route(path, {
    name: name,
    action: function() {},
    subscriptions: function() {},
    triggersEnter: function() {},
    triggersExit: function() {},
    customField: customField
  });
});