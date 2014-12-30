Route = FlowRouter.Route;


Tinytest.addAsync('Client - Route - subscribe to route subs', function (test, next) {
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


Tinytest.addAsync('Client - Route - unsubscribe to other subs', function (test, next) {
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


Tinytest.addAsync('Client - Route - add route middleware', function (test, next) {
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
