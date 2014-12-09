
Tinytest.add('Unit Tests - FlowRouter.route()', function (test) {
  var context = {};
  context._routeMap = {};
  FlowRouter.route.call(context, 'path', 'options');
  test.equal(context._routeMap, {'path': 'options'});
});
