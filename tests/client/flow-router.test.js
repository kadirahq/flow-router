
Tinytest.add('Unit Tests - FlowRouter.route()', function (test) {
  var context = {};
  context._routeMap = {};
  context._clientRouter = {};
  context._clientRouter.addRoute = function (path, options) {
    this.args = this.args || [];
    this.args.push(_.toArray(arguments));
  };

  FlowRouter.route.call(context, 'path', 'options');
  test.equal(context._routeMap, {'path': 'options'});
  test.equal(context._clientRouter.args, [
    ['path', 'options']
  ]);
});
