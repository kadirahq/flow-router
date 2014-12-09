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
