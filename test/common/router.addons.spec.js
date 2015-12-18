Router = FlowRouter.Router;

Tinytest.addAsync('Common - Addons - onRouteRegister basic usage', function(test, done) {
  var name = Random.id();
  var customField = Random.id();
  var pathDef = '/' + name;

  FlowRouter.onRouteRegister(function(route) {
    test.equal(route, {
      pathDef: pathDef,
      // Route.path is deprecated and will be removed in 3.0
      path: pathDef,
      name: name,
      options: {customField: customField}
    });

    test.equal(route.pathDef, pathDef);
    // Route.path is deprecated and will be removed in 3.0
    test.equal(route.path, pathDef);
    test.equal(route.name, name);
    test.equal(route.options.customField, customField);
    test.equal(route.options, {customField: customField});

    FlowRouter._onRouteCallbacks = [];
    done();
  });

  FlowRouter.route(pathDef, {
    name: name,
    action: function() {},
    triggersEnter: function() {},
    triggersExit: function() {},
    customField: customField
  });
});
