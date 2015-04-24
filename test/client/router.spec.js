Router = FlowRouter.Router;

Tinytest.add('Client - Router - validate path definition', function (test, next) {
  // path must start with '/'
  test.throws(function() {
    FlowRouter.route(Random.id());
  });
});

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

  FlowRouter.go('/' + rand + '/bar');

  setTimeout(function() {
    test.equal(rendered, 1);
    test.equal(params.foo, 'bar');
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
    test.equal(path, paths.pop());
    log.push(0);
    next();
  });

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
    this.register('baz', Meteor.subscribe('baz'));
  };

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
  FlowRouter._registerParams();

  var ranFor = 0;
  var c = Tracker.autorun(function() {
    var value = FlowRouter.getParam("one");
    test.equal(value, v1);
    ranFor++;
  });

  FlowRouter._current.params.two = Random.id();
  FlowRouter._registerParams();

  setTimeout(function() {
    test.equal(ranFor, 1);
    Meteor.defer(bind(c, "stop"));
    next();
  }, 100);
});

Tinytest.addAsync('Client - Router - getParam - registration', function (test, next) {
  var v1 = Random.id();
  var v2 = Random.id();

  var ranFor = 0;
  var values = [];

  FlowRouter._current.params = {};
  FlowRouter._registerParams();

  var c = Tracker.autorun(function() {
    var value = FlowRouter.getParam("one");
    values.push(value);
    ranFor++;
  });

  FlowRouter._current.params = {one: v1};
  FlowRouter._registerParams();

  setTimeout(function() {
    test.equal(ranFor, 2);
    test.equal(values, [undefined, v1]);
    Meteor.defer(bind(c, "stop"));
    next();
  }, 100);
});

Tinytest.addAsync('Client - Router - getParam - removal', function (test, next) {
  var v1 = Random.id();
  var v2 = Random.id();

  FlowRouter._current.params = {
    "one": v1
  };
  FlowRouter._registerParams();

  var ranFor = 0;
  var values = [];
  var c = Tracker.autorun(function() {
    var value = FlowRouter.getParam("one");
    values.push(value);
    ranFor++;
  });

  FlowRouter._current.params = {};
  FlowRouter._registerParams();

  setTimeout(function() {
    test.equal(ranFor, 2);
    test.equal(values, [v1, undefined]);
    Meteor.defer(bind(c, "stop"));
    next();
  }, 100);
});

Tinytest.addAsync('Client - Router - getQueryParam - do not change', function (test, next) {
  var v1 = Random.id();
  var v2 = Random.id();

  FlowRouter._current.queryParams = {
    "one": v1,
    "two": v2
  };
  FlowRouter._registerQueryParams();

  var ranFor = 0;
  var c = Tracker.autorun(function() {
    var value = FlowRouter.getQueryParam("one");
    test.equal(value, v1);
    ranFor++;
  });

  FlowRouter._current.queryParams.two = Random.id();
  FlowRouter._registerQueryParams();

  setTimeout(function() {
    test.equal(ranFor, 1);
    Meteor.defer(bind(c, "stop"));
    next();
  }, 100);
});

Tinytest.addAsync('Client - Router - getQueryParam - change', function (test, next) {
  var v1 = Random.id();
  var v2 = Random.id();

  FlowRouter._current.queryParams = {
    "one": v1,
    "two": v2
  };
  FlowRouter._registerQueryParams();

  var ranFor = 0;
  var c = Tracker.autorun(function() {
    var value = FlowRouter.getQueryParam("one");
    ranFor++;
  });

  FlowRouter._current.queryParams.one = Random.id();
  FlowRouter._registerQueryParams();

  setTimeout(function() {
    test.equal(ranFor, 2);
    Meteor.defer(bind(c, "stop"));
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
  test.equal(path, expectedPath);
});

Tinytest.add('Client - Router - path - queryParams', function (test) {
  var pathDef = "/blog/:blogId/some/:name";
  var fields = {
    blogId: "1001",
    name: "superb"
  };

  var queryParams = {
    aa: "100",
    bb: "200"
  };

  var expectedPath = "/blog/1001/some/superb?aa=100&bb=200";

  var path = FlowRouter.path(pathDef, fields, queryParams);
  test.equal(path, expectedPath);
});

Tinytest.add('Client - Router - path - just queryParams', function (test) {
  var pathDef = "/blog/abc";
  var queryParams = {
    aa: "100",
    bb: "200"
  };

  var expectedPath = "/blog/abc?aa=100&bb=200";

  var path = FlowRouter.path(pathDef, null, queryParams);
  test.equal(path, expectedPath);
});


Tinytest.add('Client - Router - path - missing fields', function (test) {
  var pathDef = "/blog/:blogId/some/:name";
  var fields = {
    blogId: "1001",
  };
  var expectedPath = "/blog/1001/some/";

  var path = FlowRouter.path(pathDef, fields);
  test.equal(path, expectedPath);
});

Tinytest.add('Client - Router - path - no fields', function (test) {
  var pathDef = "/blog/blogId/some/name";
  var path = FlowRouter.path(pathDef);
  test.equal(path, pathDef);
});

Tinytest.add('Client - Router - path - complex route', function (test) {
  var pathDef = "/blog/:blogId/some/:name(\\d*)+";
  var fields = {
    blogId: "1001",
    name: 20
  };
  var expectedPath = "/blog/1001/some/20";

  var path = FlowRouter.path(pathDef, fields);
  test.equal(path, expectedPath);
});

Tinytest.add('Client - Router - path - optional last param missing', function (test) {
  var pathDef = "/blog/:blogId/some/:name?";
  var fields = {
    blogId: "1001"
  };
  var expectedPath = "/blog/1001/some/";

  var path = FlowRouter.path(pathDef, fields);
  test.equal(path, expectedPath);
});

Tinytest.add('Client - Router - path - optional last param exists', function (test) {
  var pathDef = "/blog/:blogId/some/:name?";
  var fields = {
    blogId: "1001",
    name: 20
  };
  var expectedPath = "/blog/1001/some/20";

  var path = FlowRouter.path(pathDef, fields);
  test.equal(path, expectedPath);
});

Tinytest.addAsync('Client - Router - setParams - generic', function (test, done) {
  var randomKey = Random.id();
  var pathDef = "/" + randomKey + "/:cat/:id";
  var paramsList = [];
  FlowRouter.route(pathDef, {
    action: function(params) {
      paramsList.push(params);
    }
  });

  FlowRouter.go(pathDef, {cat: "meteor", id: "200"});
  setTimeout(function() {
    // return done();
    var success = FlowRouter.setParams({id: "700"});
    test.isTrue(success);
    setTimeout(validate, 50);
  }, 50);

  function validate() {
    test.equal(paramsList.length, 2);
    test.equal(_.pick(paramsList[0], "id", "cat"), {cat: "meteor", id: "200"});
    test.equal(_.pick(paramsList[1], "id", "cat"), {cat: "meteor", id: "700"});
    done();
  }
});

Tinytest.addAsync('Client - Router - setParams - preserve query strings', function (test, done) {
  var randomKey = Random.id();
  var pathDef = "/" + randomKey + "/:cat/:id";
  var paramsList = [];
  var queryParamsList = [];

  FlowRouter.route(pathDef, {
    action: function(params, queryParams) {
      paramsList.push(params);
      queryParamsList.push(queryParams);
    }
  });

  FlowRouter.go(pathDef, {cat: "meteor", id: "200"}, {aa: "20"});
  setTimeout(function() {
    // return done();
    var success = FlowRouter.setParams({id: "700"});
    test.isTrue(success);
    setTimeout(validate, 50);
  }, 50);

  function validate() {
    test.equal(paramsList.length, 2);
    test.equal(queryParamsList.length, 2);

    test.equal(_.pick(paramsList[0], "id", "cat"), {cat: "meteor", id: "200"});
    test.equal(_.pick(paramsList[1], "id", "cat"), {cat: "meteor", id: "700"});
    test.equal(queryParamsList, [{aa: "20"}, {aa: "20"}]);
    done();
  }
});

Tinytest.add('Client - Router - setParams - no route selected', function (test) {
  var originalRoute = FlowRouter._current.route;
  FlowRouter._current.route = undefined;
  var success = FlowRouter.setParams({id: "800"});
  test.isFalse(success);
  FlowRouter._current.route = originalRoute;
});

Tinytest.addAsync('Client - Router - setQueryParams - generic', function (test, done) {
  var randomKey = Random.id();
  var pathDef = "/" + randomKey + "";
  var queryParamsList = [];
  FlowRouter.route(pathDef, {
    action: function(params, queryParams) {
      queryParamsList.push(queryParams);
    }
  });

  FlowRouter.go(pathDef, {}, {cat: "meteor", id: "200"});
  setTimeout(function() {
    // return done();
    var success = FlowRouter.setQueryParams({id: "700"});
    test.isTrue(success);
    setTimeout(validate, 50);
  }, 50);

  function validate() {
    test.equal(queryParamsList.length, 2);
    test.equal(_.pick(queryParamsList[0], "id", "cat"), {cat: "meteor", id: "200"});
    test.equal(_.pick(queryParamsList[1], "id", "cat"), {cat: "meteor", id: "700"});
    done();
  }
});

Tinytest.addAsync('Client - Router - setQueryParams - remove query param null', function (test, done) {
  var randomKey = Random.id();
  var pathDef = "/" + randomKey + "";
  var queryParamsList = [];
  FlowRouter.route(pathDef, {
    action: function(params, queryParams) {
      queryParamsList.push(queryParams);
    }
  });

  FlowRouter.go(pathDef, {}, {cat: "meteor", id: "200"});
  setTimeout(function() {
    var success = FlowRouter.setQueryParams({id: "700", cat: null});
    test.isTrue(success);
    setTimeout(validate, 50);
  }, 50);

  function validate() {
    test.equal(queryParamsList.length, 2);
    test.equal(_.pick(queryParamsList[0], "id", "cat"), {cat: "meteor", id: "200"});
    test.equal(queryParamsList[1], {id: "700"});
    done();
  }
});

Tinytest.addAsync('Client - Router - setQueryParams - remove query param undefined', function (test, done) {
  var randomKey = Random.id();
  var pathDef = "/" + randomKey + "";
  var queryParamsList = [];
  FlowRouter.route(pathDef, {
    action: function(params, queryParams) {
      queryParamsList.push(queryParams);
    }
  });

  FlowRouter.go(pathDef, {}, {cat: "meteor", id: "200"});
  setTimeout(function() {
    var success = FlowRouter.setQueryParams({id: "700", cat: undefined});
    test.isTrue(success);
    setTimeout(validate, 50);
  }, 50);

  function validate() {
    test.equal(queryParamsList.length, 2);
    test.equal(_.pick(queryParamsList[0], "id", "cat"), {cat: "meteor", id: "200"});
    test.equal(queryParamsList[1], {id: "700"});
    done();
  }
});

Tinytest.addAsync('Client - Router - setQueryParams - preserve params', function (test, done) {
  var randomKey = Random.id();
  var pathDef = "/" + randomKey + "/:abc";
  var queryParamsList = [];
  var paramsList = [];
  FlowRouter.route(pathDef, {
    action: function(params, queryParams) {
      paramsList.push(params);
      queryParamsList.push(queryParams);
    }
  });

  FlowRouter.go(pathDef, {abc: "20"}, {cat: "meteor", id: "200"});
  setTimeout(function() {
    // return done();
    var success = FlowRouter.setQueryParams({id: "700"});
    test.isTrue(success);
    setTimeout(validate, 50);
  }, 50);

  function validate() {
    test.equal(queryParamsList.length, 2);
    test.equal(queryParamsList, [
      {cat: "meteor", id: "200"}, {cat: "meteor", id: "700"}
    ]);

    test.equal(paramsList.length, 2);
    test.equal(_.pick(paramsList[0], "abc"), {abc: "20"});
    test.equal(_.pick(paramsList[1], "abc"), {abc: "20"});
    done();
  }
});

Tinytest.add('Client - Router - setQueryParams - no route selected', function (test) {
  var originalRoute = FlowRouter._current.route;
  FlowRouter._current.route = undefined;
  var success = FlowRouter.setQueryParams({id: "800"});
  test.isFalse(success);
  FlowRouter._current.route = originalRoute;
});

Tinytest.addAsync('Client - Router - notFound', function (test, done) {
  var data = [];
  FlowRouter.notFound = {
    subscriptions: function() {
      data.push("subscriptions");
    },
    action: function() {
      data.push("action");
    }
  };

  FlowRouter.go("/" + Random.id());
  setTimeout(function() {
    test.equal(data, ["subscriptions", "action"]);
    done();
  }, 50);
});

function bind(obj, method) {
  return function() {
    obj[method].apply(obj, arguments);
  };
}
