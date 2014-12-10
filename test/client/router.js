Tinytest.addAsync('parse params and query string', function (test, next) {
  var rand = Random.id();
  var rendered = 0;
  var params = null;

  FlowRouter.route('/' + rand + '/:foo', {
    render: function(_params) {
      rendered++;
      params = _params;
    }
  });

  FlowRouter.go('/' + rand + '/bar?baz=bat');

  setTimeout(function() {
    test.equal(rendered, 1);
    test.equal(params.foo, 'bar');
    test.equal(params.query, {'baz': 'bat'});
    next();
  }, 50)
});


Tinytest.addAsync('subscribe to route subs', function (test, next) {
  var rand = Random.id();

  FlowRouter.route('/' + rand, {
    render: Function.prototype,
    subscriptions: function () {
      this.subscribe('foo', Meteor.subscribe('foo'));
    }
  });

  FlowRouter.go('/' + rand);
  setTimeout(function() {
    test.isTrue(!!GetSub('foo'));
    next();
  }, 50)
});


Tinytest.addAsync('unsubscribe to other subs', function (test, next) {
  var rand = Random.id(), rand2 = Random.id();

  FlowRouter.route('/' + rand, {
    render: Function.prototype,
    subscriptions: function () {
      this.subscribe('foo', Meteor.subscribe('foo'));
    }
  });

  FlowRouter.route('/' + rand2, {
    render: Function.prototype,
    subscriptions: function () {
      this.subscribe('bar', Meteor.subscribe('bar'));
    }
  });

  FlowRouter.go('/' + rand);
  setTimeout(function() {
    test.isTrue(!!GetSub('foo'));
    test.isFalse(!!GetSub('bar'));
    FlowRouter.go('/' + rand2);

    setTimeout(function() {
      test.isTrue(!!GetSub('bar'));
      test.isFalse(!!GetSub('foo'));
      next();
    }, 50)
  }, 50)
});


Tinytest.addAsync('use global middleware', function (test, next) {
  var rand = Random.id(), rand2 = Random.id();
  var log = [];
  var paths = ['/' + rand2, '/' + rand];
  var done = false;

  FlowRouter.route('/' + rand, {
    render: function(_params) {
      log.push(1);
    }
  });

  FlowRouter.route('/' + rand2, {
    render: function(_params) {
      log.push(2);
    }
  });

  FlowRouter.middleware(function (path, next) {
    if(done) return next();
    test.equal(path, paths.pop())
    log.push(0);
    next();
  })

  FlowRouter.go('/' + rand);

  setTimeout(function() {
    FlowRouter.go('/' + rand2);

    setTimeout(function() {
      test.equal(log, [0, 1, 0, 2]);
      done = true;
      next();
    }, 50)
  }, 50)
});


Tinytest.addAsync('route specific middleware', function (test, next) {
  var rand = Random.id(), rand2 = Random.id();
  var log = [];

  FlowRouter.route('/' + rand, {
    render: function(_params) {
      log.push(1);
    }
  }).middleware(function (path, next) {
    test.equal(path, '/' + rand)
    log.push(0);
    next();
  });

  FlowRouter.route('/' + rand2, {
    render: function(_params) {
      log.push(2);
    }
  });

  FlowRouter.go('/' + rand);

  setTimeout(function() {
    FlowRouter.go('/' + rand2);

    setTimeout(function() {
      test.equal(log, [0, 1, 2]);
      next();
    }, 50)
  }, 50);
});


Tinytest.addAsync('set global state', function (test, next) {
  var rand = Random.id();
  var rendered = 0;

  FlowRouter.route('/' + rand, {
    render: function(_params) {
      rendered++;
    }
  });

  FlowRouter.go('/' + rand);

  setTimeout(function() {
    FlowRouter.setState('foo', 'bar');
    FlowRouter.setState('bar', 'baz');

    setTimeout(function() {
      test.equal(rendered, 1);
      test.equal(location.search, '?foo=bar&bar=baz');
      next();
    }, 50)
  }, 50)
})


Tinytest.addAsync('get global state', function (test, next) {
  // get state
})
