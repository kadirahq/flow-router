
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


Tinytest.add('Unit Tests - FlowRouter.setState()', function (test) {
  var context = {};
  context._routeStates = new ReactiveDict;
  context._clientRouter = {};
  context._clientRouter.setState = function (path, options) {
    this.args = this.args || [];
    this.args.push(_.toArray(arguments));
  };

  FlowRouter.setState.call(context, 'name', 'value');
  test.equal(context._routeStates.get('name'), 'value');
  test.equal(context._clientRouter.args, [
    ['name', 'value']
  ]);
});


Tinytest.add('Unit Tests - FlowRouter.getState()', function (test) {
  var context = {};
  context._routeStates = new ReactiveDict;
  context._routeStates.set('name', 'value');
  var value = FlowRouter.getState.call(context, 'name');
  test.equal(value, 'value');
});
