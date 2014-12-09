
Tinytest.add('FlowRouter.route() - add route', function (test) {
  var context = {};
  context._routeMap = {};
  context._FlowRoute = function (path, options) {
    this.path = path;
    this.options = options;
  };
  FlowRouter.route.call(context, 'path', 'options');
  test.equal(context._routeMap, {
    'path': new context._FlowRoute('path', 'options')
  });
});
