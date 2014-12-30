Router = FlowRouter.Router;


Tinytest.addAsync('Client - Router - define and go to route', function (test, next) {
  var rand = Random.id();
  var rendered = 0;

  FlowRouter.route('/' + rand, {
    render: function(_params) {
      rendered++;
    }
  });

  FlowRouter.go('/' + rand);

  setTimeout(function() {
    test.equal(rendered, 1);
    setTimeout(next, 100);
  }, 100);
})


Tinytest.addAsync('Client - Router - parse params and query', function (test, next) {
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
    FlowRouter.clearStates();
    setTimeout(next, 100);
  }, 100);
});


Tinytest.addAsync('Client - Router - add global middleware', function (test, next) {
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
      setTimeout(next, 100);
    }, 100);
  }, 100);
});


Tinytest.addAsync('Client - Router - set states', function (test, next) {
  var rand = Random.id();
  var value = Random.id();
  var rendered = 0;

  FlowRouter.globals = ['arr', 'obj'];

  FlowRouter.route('/' + rand, {
    render: function(_params) {
      rendered++;
    }
  });

  FlowRouter.go('/' + rand);

  setTimeout(function() {
    FlowRouter.setState('loc', value);
    FlowRouter.setState('arr', [value]);
    FlowRouter.setState('obj', {key: value});

    setTimeout(function() {
      var query = '?loc='+value+'&arr[0]='+value+'&obj[key]='+value;
      test.equal(rendered, 2);
      test.equal(location.search, query);
      test.equal(FlowRouter._states.arr, [value]);
      test.equal(FlowRouter._states.obj, {key: value});
      test.equal(FlowRouter._current.route._states.loc, value);
      // clear states before other tests
      FlowRouter.clearStates();
      setTimeout(next, 100);
    }, 100);
  }, 100);
})


Tinytest.addAsync('Client - Router - get states', function (test, next) {
  var rand = Random.id();
  FlowRouter.go('/');
  FlowRouter.globals = ['glo'];

  setTimeout(function() {
    FlowRouter.setState('glo', rand);
    FlowRouter.setState('loc', rand);

    setTimeout(function() {
      test.equal(FlowRouter.getState('glo'), rand);
      test.equal(FlowRouter.getState('loc'), rand);
      // clear states before other tests
      FlowRouter.clearStates();
      setTimeout(next, 100);
    }, 100);
  }, 100);
})


Tinytest.addAsync('Client - Router - states from url', function (test, next) {
  var rand = Random.id();
  var value = Random.id();
  FlowRouter.globals = ['foo'];
  FlowRouter.route('/' + rand);
  FlowRouter.go('/' + rand + '?foo=' + value + '&bar=' + value);

  setTimeout(function() {
    test.equal(FlowRouter._states.foo, value);
    test.equal(FlowRouter._current.route._states.bar, value);
    // clear states before other tests
    FlowRouter.clearStates();
    setTimeout(next, 100);
  }, 100);
});


Tinytest.addAsync('Client - Router - get current route', function (test, next) {
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
