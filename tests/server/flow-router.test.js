Tinytest.add('FlowRouter - route() - add route', function (test) {
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


Tinytest.add('FlowRouter - middleware() - add middleware', function (test) {
  var context = {};
  context._middleware = [];
  FlowRouter.middleware.call(context, 'middleware');
  test.equal(context._middleware, [
    'middleware'
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


Tinytest.add('FlowRouter - _getCurrentRoute() - simple', function (test) {
  var context = {};
  context._current = 'path';
  context._routeMap = {};
  context._routeMap['path'] = 'route';
  var route = FlowRouter._getCurrentRoute.call(context);
  test.equal(route, 'route');
});
