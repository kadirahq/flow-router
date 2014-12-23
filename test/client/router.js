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

    // clear states before other tests
    FlowRouter._states = {};
    next();
  }, 100);
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
  }, 100);
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
    }, 100);
  }, 100);
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

  FlowRouter.middleware(function (context, next) {
    if(done) return next();
    test.equal(context.path, paths.pop())
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
    }, 100);
  }, 100);
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
    }, 100);
  }, 100);
});


Tinytest.addAsync('set global state', function (test, next) {
  var rand = Random.id();
  var randValue = Random.id();
  var rendered = 0;

  FlowRouter.route('/' + rand, {
    render: function(_params) {
      rendered++;
    }
  });

  FlowRouter.go('/' + rand);

  setTimeout(function() {
    FlowRouter.setState('str', randValue);
    FlowRouter.setState('arr', [randValue]);
    FlowRouter.setState('obj', {key: randValue});

    setTimeout(function() {
      var query = '?str='+randValue+'&arr[0]='+randValue+'&obj[key]='+randValue;
      test.equal(rendered, 2);
      test.equal(location.search, query);
      // clear states before other tests
      FlowRouter._states = {};
      next();
    }, 100);
  }, 100);
})

Tinytest.addAsync('get global state', function (test, next) {
  var rand = Random.id();
  FlowRouter.go('/');

  setTimeout(function() {
    FlowRouter.setState('rand', rand);

    setTimeout(function() {
      var value = FlowRouter.getState('rand');
      test.equal(value, rand);
      // clear states before other tests
      FlowRouter._states = {};
      next();
    }, 100);
  }, 100);
})


Tinytest.addAsync('automatically set route states', function (test, next) {
  var rand = Random.id();
  var randValue = Random.id();
  FlowRouter.route('/' + rand);
  FlowRouter.go('/' + rand + '?foo=' + randValue);

  setTimeout(function() {
    var value = FlowRouter.getState('foo');
    test.equal(value, randValue);
    // clear states before other tests
    FlowRouter._states = {};
    next();
  }, 100);
});

Tinytest.addAsync('FlowRouter.current()', function (test, next) {
  var rand = Random.id();
  var rand2 = Random.id();
  var rendered = 0;
  var params = null;

  var visitedPaths = [];
  var tracker = Tracker.autorun(function() {
    var current = FlowRouter.current();
    if(current.path) {
      visitedPaths.push(current.path);
    } 
  });

  FlowRouter.route('/' + rand, {
    render: function(_params) {

    }
  });

  FlowRouter.route('/' + rand2, {
    render: function(_params) {
      
    }
  });

  visitedPaths = [];
  FlowRouter.go('/' + rand);
  setTimeout(function() {
    FlowRouter.go('/' + rand2);
    setTimeout(function() {
      test.equal(visitedPaths, [
        '/' + rand,
        '/' + rand2
      ]);
      next();
    }, 100);
  }, 100);
});