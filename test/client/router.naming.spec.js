Tinytest.addAsync('Client - Router - Naming - define and go to route', function (test, next) {
  var name = Random.id();
  var path = '/' + Random.id();
  var rendered = 0;

  FlowRouter.route(path, {
    name: name,
    action: function(_params) {
      rendered++;
    }
  });

  FlowRouter.go(name);

  setTimeout(function() {
    test.equal(rendered, 1);
    setTimeout(next, 100);
  }, 100);
});

Tinytest.add('Client - Router - Naming - define and get path', function (test, next) {
  var name = Random.id();
  var path = '/' + Random.id();
  var rendered = 0;

  FlowRouter.route(path, {
    name: name
  });

  test.equal(FlowRouter.path(name), path);
});

Tinytest.add('Client - Router - Naming - get route name', function (test, next) {
  var name = Random.id();
  var path = '/' + Random.id();
  var rendered = 0;

  var route = FlowRouter.route(path, {
    name: name
  });

  test.equal(route.name, name);
});
