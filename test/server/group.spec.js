Tinytest.add('Server - Group - define route with nested prefix', function (test) {
  var firstPrefix = Random.id();
  var secondPrefix = Random.id();
  var routePath = Random.id();
  var routeName = Random.id();

  var firstGroup = FlowRouter.group({prefix: '/' + firstPrefix});
  var secondGroup = firstGroup.group({prefix: '/' + secondPrefix});

  secondGroup.route('/' + routePath, {name: routeName});

  test.equal(FlowRouter.path(routeName), '/' + firstPrefix + '/' + secondPrefix + '/' + routePath);
});
