Tinytest.add('FlowRoute - constructor() - simple', function (test) {
  var context = {};
  var options = {render: 'render', subscriptions: 'subscriptions'};
  FlowRoute = FlowRouter._FlowRoute;
  FlowRoute.call(context, 'path', options);
  test.equal(context, {
    path: 'path',
    render: 'render',
    subscriptions: 'subscriptions',
    _middleware: [],
    _subsMap: {},
  })
});


Tinytest.add('FlowRoute - middleware() - add middleware', function (test) {
  var context = {};
  context._middleware = [];
  FlowRoute = FlowRouter._FlowRoute;
  FlowRoute.prototype.middleware.call(context, 'middleware');
  test.equal(context._middleware, [
    'middleware'
  ]);
});


Tinytest.add('FlowRoute - subscribe() - default options', function (test) {
  var context = {};
  context._subsMap = {};
  FlowRoute = FlowRouter._FlowRoute;
  context._getDefaultSubOptions = FlowRoute.prototype._getDefaultSubOptions;
  FlowRoute.prototype.subscribe.call(context, 'name', 'sub');
  test.equal(context._subsMap, {
    'name': 'sub'
  })
});


Tinytest.add('FlowRoute - subscribe() - no server', function (test) {
  var context = {};
  context._subsMap = {};
  FlowRoute = FlowRouter._FlowRoute;
  context._getDefaultSubOptions = FlowRoute.prototype._getDefaultSubOptions;
  FlowRoute.prototype.subscribe.call(context, 'name', 'sub', {server: false});
  test.equal(context._subsMap, {
    // 'name': 'sub' // should not be there
  })
});


Tinytest.add('FlowRoute - _getDefaultSubOptions() - simple', function (test) {
  var context = {};
  FlowRoute = FlowRouter._FlowRoute;
  var options = FlowRoute.prototype._getDefaultSubOptions.call(context);
  test.equal(options, {
    server: true,
    client: true,
  })
});
