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

Tinytest.add('Client - Router - Naming - get route name (from route instance)', function (test, next) {
  var name = Random.id();
  var path = '/' + Random.id();
  var rendered = 0;

  var route = FlowRouter.route(path, {
    name: name
  });

  test.equal(route.name, name);
});

Tinytest.add('Client - Router - Naming - getRouteName() registration', function (test) {
  var randomName = Random.id();

  FlowRouter._current.route.name = randomName;
  FlowRouter._registerRouteName();

  test.equal(randomName, FlowRouter.getRouteName());
});

Tinytest.addAsync('Client - Router - Naming - getRouteName() reactive', function (test, next) {
  var routeName = Random.id();
  FlowRouter.route('/' + Random.id(), { name: routeName });

  Tracker.autorun(function(c) {
    var currentRouteName = FlowRouter.getRouteName();

    if (c.firstRun) {
      FlowRouter.go(routeName);
    } else {
      test.equal(currentRouteName, routeName);
      c.stop();
      next();
    }
  });
});
