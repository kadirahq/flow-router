Tinytest.add('FlowRouter - route() - add route', function (test) {
  var context = {};
  context._routeMap = {};
  context._FlowRoute = function (path, options) {
    this.args = _.toArray(arguments);
  };

  FlowRouter.route.call(context, 'path', 'options');
  test.equal(context._routeMap, {
    'path': new context._FlowRoute('path', 'options')
  });
});


Tinytest.add('FlowRouter - middleware() - add middleware', function (test) {
  var context = {};
  context._middleware = [];

  context._clientRouter = {};
  context._clientRouter.middleware = function (middleware) {
    this.args = this.args || [];
    this.args.push(_.toArray(arguments));
  };

  FlowRouter.middleware.call(context, 'middleware');
  test.equal(context._middleware, [
    'middleware'
  ]);
  test.equal(context._clientRouter.args, [
    ['middleware']
  ]);
});


Tinytest.add('FlowRouter - subscribe() - current route', function (test) {
  var context = {};
  context._getCurrentRoute = function () {
    return {
      subscriptions: function () {
        context.args = context.args || [];
        context.args.push(_.toArray(arguments));
      }
    }
  };

  FlowRouter.subscribe.call(context);
  test.equal(context.args, [
    []
  ]);
});


Tinytest.add('FlowRouter - setState() - set local', function (test) {
  var context = {};
  context._getDefaultStateOptions = FlowRouter._getDefaultStateOptions;
  context._getCurrentRoute = function () {
    return {
      setState: function () {
        context.args = context.args || [];
        context.args.push(_.toArray(arguments));
      }
    }
  };

  var defaultOptions = FlowRouter._getDefaultStateOptions.call(null);
  FlowRouter.setState.call(context, 'name', 'value');
  test.equal(context.args, [
    ['name', 'value', defaultOptions]
  ]);
});


Tinytest.add('FlowRouter - setState() - set global', function (test) {
  var context = {};
  context._globalStates = new ReactiveDict;
  context._getDefaultStateOptions = FlowRouter._getDefaultStateOptions;

  context._clientRouter = {};
  context._clientRouter.setState = function (name, value, options) {
    this.args = this.args || [];
    this.args.push(_.toArray(arguments));
  };

  FlowRouter.setState.call(context, 'name', 'value', {global: true});
  test.equal(context._globalStates.get('name'), 'value');
  test.equal(context._clientRouter.args, [
    ['name', 'value', {global: true}]
  ]);
});


Tinytest.add('FlowRouter - getState() - get local', function (test) {
  var context = {};
  context._globalStates = new ReactiveDict;
  context._globalStates.set('name', 'global-value');
  context._current = 'path';
  context._routeMap = {};
  context._routeMap['path'] = {
    getState: function (name, value, options) {
      this.args = this.args || [];
      this.args.push(_.toArray(arguments));
      return 'local-value';
    }
  };

  var value = FlowRouter.getState.call(context, 'name');
  test.equal(value, 'local-value');
});


Tinytest.add('FlowRouter - getState() - get global', function (test) {
  var context = {};
  context._globalStates = new ReactiveDict;
  context._globalStates.set('name', 'global-value');
  context._current = 'path';
  context._routeMap = {};
  context._routeMap['path'] = {
    getState: function (name, value, options) {
      this.args = this.args || [];
      this.args.push(_.toArray(arguments));
      return null;
    }
  };

  var value = FlowRouter.getState.call(context, 'name');
  test.equal(value, 'global-value');
});


Tinytest.add('FlowRouter - _getDefaultStateOptions() - simple', function (test) {
  var context = {};
  var options = FlowRouter._getDefaultStateOptions.call(context);
  test.equal(options, {
    global: false,
  })
});


Tinytest.add('FlowRouter - _getCurrentRoute() - simple', function (test) {
  var context = {};
  context._current = 'path';
  context._routeMap = {};
  context._routeMap['path'] = 'route';
  var route = FlowRouter._getCurrentRoute.call(context);
  test.equal(route, 'route');
});
