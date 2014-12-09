Tinytest.add('FlowRouter.route() - add route', function (test) {
  var context = {};
  context._routeMap = {};
  context._FlowRoute = function (path, options) {
    this.path = path;
    this.options = options;
  };

  context._clientRouter = {};
  context._clientRouter.route = function (path, options) {
    this.args = this.args || [];
    this.args.push(_.toArray(arguments));
  };

  FlowRouter.route.call(context, 'path', 'options');
  test.equal(context._routeMap, {
    'path': new context._FlowRoute('path', 'options')
  });
  test.equal(context._clientRouter.args, [
    ['path', 'options']
  ]);
});


Tinytest.add('FlowRouter.setState() - set local', function (test) {
  var context = {};
  context._getDefaultStateOptions = FlowRouter._getDefaultStateOptions;
  context._current = 'path';
  context._routeMap = {};
  context._routeMap['path'] = {
    setState: function (name, value, options) {
      this.args = this.args || [];
      this.args.push(_.toArray(arguments));
    }
  };

  context._clientRouter = {};
  context._clientRouter.setState = function (name, value, options) {
    this.args = this.args || [];
    this.args.push(_.toArray(arguments));
  };

  var defaultOptions = FlowRouter._getDefaultStateOptions.call(null);
  FlowRouter.setState.call(context, 'name', 'value');
  test.equal(context._routeMap['path'].args, [
    ['name', 'value', defaultOptions]
  ]);
  test.equal(context._clientRouter.args, [
    ['name', 'value', defaultOptions]
  ]);
});


Tinytest.add('FlowRouter.setState() - set global', function (test) {
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


Tinytest.add('FlowRouter.getState() - get local', function (test) {
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


Tinytest.add('FlowRouter.getState() - get global', function (test) {
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


Tinytest.add('FlowRouter._getDefaultStateOptions() - simple', function (test) {
  var context = {};
  var options = FlowRouter._getDefaultStateOptions.call(context);
  test.equal(options, {
    global: false,
  })
});
