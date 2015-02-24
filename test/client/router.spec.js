Router = FlowRouter.Router;
Tinytest.addAsync('Client - Router - define and go to route', function (test, next) {
  var rand = Random.id();
  var rendered = 0;

  FlowRouter.route('/' + rand, {
    action: function(_params) {
      rendered++;
    }
  });

  FlowRouter.go('/' + rand);

  setTimeout(function() {
    test.equal(rendered, 1);
    setTimeout(next, 100);
  }, 100);
});

Tinytest.addAsync('Client - Router - define and go to route with fields',
function (test, next) {
  var rand = Random.id();
  var pathDef = "/" + rand + "/:key";
  var rendered = 0;

  FlowRouter.route(pathDef, {
    action: function(params) {
      test.equal(params.key, "abc");
      rendered++;
    }
  });

  FlowRouter.go(pathDef, {key: "abc"});

  setTimeout(function() {
    test.equal(rendered, 1);
    setTimeout(next, 100);
  }, 100);
});

Tinytest.addAsync('Client - Router - parse params and query', function (test, next) {
  var rand = Random.id();
  var rendered = 0;
  var params = null;

  FlowRouter.route('/' + rand + '/:foo', {
    action: function(_params) {
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
    action: function(_params) {
      log.push(1);
    }
  });

  FlowRouter.route('/' + rand2, {
    action: function(_params) {
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
      setTimeout(next, 100);
    }, 100);
  }, 100);
});

Tinytest.addAsync('Client - Router - redirect using middleware', function (test, next) {
  var rand = Random.id(), rand2 = Random.id();
  var log = [];
  var paths = ['/' + rand2, '/' + rand];
  var done = false;

  FlowRouter.route(paths[0], {
    action: function(_params) {
      log.push(1);
    }
  });

  FlowRouter.route(paths[1], {
    action: function(_params) {
      log.push(2);
    }
  });

  FlowRouter.middleware(function (path, next) {
    if(path == paths[0]) {
      next(paths[1]);
    } else {
      next();
    }
  });

  FlowRouter.go(paths[0]);

  setTimeout(function() {
    test.equal(log, [2]);
    done = true;
    next();
  }, 100);
});

Tinytest.addAsync('Client - Router - set states', function (test, next) {
  var rand = Random.id();
  var value = Random.id();
  var rendered = 0;

  FlowRouter.globals = ['arr', 'obj'];

  FlowRouter.route('/' + rand, {
    action: function(_params) {
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
      test.equal(FlowRouter._globalRoute._states.arr, [value]);
      test.equal(FlowRouter._globalRoute._states.obj, {key: value});
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
    test.equal(FlowRouter._globalRoute._states.foo, value);
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
    var current = FlowRouter.reactiveCurrent();
    if(current.path) {
      visitedPaths.push(current.path);
    }
  });

  FlowRouter.route('/' + rand, {
    action: function(_params) {

    }
  });

  FlowRouter.route('/' + rand2, {
    action: function(_params) {

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


Tinytest.addAsync('Client - Router - get current route path', function (test, next) {
  var value = Random.id();
  var randomValue = Random.id();
  var routePath = "/" + randomValue + '/:_id';
  var path = "/" + randomValue + "/" + value;

  var detectedValue = null;

  FlowRouter.route(routePath, {
    action: function(params) {
      detectedValue = params._id;
    }
  });

  FlowRouter.go(path);

  Meteor.setTimeout(function() {
    test.equal(detectedValue, value);
    test.equal(FlowRouter.current().path, path);
    next();
  }, 50);
});

Tinytest.addAsync('Client - Router - subscribe to global subs', function (test, next) {
  var rand = Random.id();
  FlowRouter.route('/' + rand);

  FlowRouter.subscriptions = function (path) {
    test.equal(path, '/' + rand);
    this.subscribe('baz', Meteor.subscribe('baz'));
  }

  FlowRouter.go('/' + rand);
  setTimeout(function() {
    test.isTrue(!!GetSub('baz'));
    FlowRouter.subscriptions = Function.prototype;
    next();
  }, 100);
});

Tinytest.addAsync('Client - Router - getParam - reactive params', function (test, next) {
  var v1 = Random.id();
  var v2 = Random.id();

  FlowRouter._current.params = {
    "one": v1,
    "two": v2
  };
  FlowRouter._setParams();

  var ranFor = 0;
  var c = Tracker.autorun(function() {
    var value = FlowRouter.getParam("one");
    test.equal(value, v1);
    ranFor++;
  });

  FlowRouter._current.params.two = Random.id();
  FlowRouter._setParams();

  setTimeout(function() {
    test.equal(ranFor, 1);
    Meteor.defer(c.stop.bind(c));
    next();
  }, 100);
});

Tinytest.addAsync('Client - Router - getParam - registration', function (test, next) {
  var v1 = Random.id();
  var v2 = Random.id();

  var ranFor = 0;
  var values = [];

  FlowRouter._current.params = {}
  FlowRouter._setParams();

  var c = Tracker.autorun(function() {
    var value = FlowRouter.getParam("one");
    values.push(value);
    ranFor++;
  });

  FlowRouter._current.params = {one: v1};
  FlowRouter._setParams();

  setTimeout(function() {
    test.equal(ranFor, 2);
    test.equal(values, [undefined, v1]);
    Meteor.defer(c.stop.bind(c));
    next();
  }, 100);
});

Tinytest.addAsync('Client - Router - getParam - removal', function (test, next) {
  var v1 = Random.id();
  var v2 = Random.id();

  FlowRouter._current.params = {
    "one": v1
  };
  FlowRouter._setParams();

  var ranFor = 0;
  var values = [];
  var c = Tracker.autorun(function() {
    var value = FlowRouter.getParam("one");
    values.push(value);
    ranFor++;
  });

  FlowRouter._current.params = {};
  FlowRouter._setParams();

  setTimeout(function() {
    test.equal(ranFor, 2);
    test.equal(values, [v1, undefined]);
    Meteor.defer(c.stop.bind(c));
    next();
  }, 100);
});

Tinytest.add('Client - Router - path - generic', function (test) {
  var pathDef = "/blog/:blogId/some/:name";
  var fields = {
    blogId: "1001",
    name: "superb"
  };
  var expectedPath = "/blog/1001/some/superb";

  var path = FlowRouter.path(pathDef, fields);
  test.equal(path, expectedPath)
});

Tinytest.add('Client - Router - path - missing fields', function (test) {
  var pathDef = "/blog/:blogId/some/:name";
  var fields = {
    blogId: "1001",
  };
  var expectedPath = "/blog/1001/some/";

  var path = FlowRouter.path(pathDef, fields);
  test.equal(path, expectedPath)
});

Tinytest.add('Client - Router - path - no fields', function (test) {
  var pathDef = "/blog/blogId/some/name";
  var path = FlowRouter.path(pathDef);
  test.equal(path, pathDef)
});