Tinytest.add('define a route on both client and server', function (test) {
  var rand = Random.id();
  var err = null;

  try {
    FlowRouter.route('/' + rand, {
      subscriptions: Function.prototype,
      render: Function.prototype,
    });
  } catch(e) {
    err = e;
  }

  test.isFalse(!!err);
  test.isTrue(!!FlowRouter._routeMap['/' + rand]);
})
