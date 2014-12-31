Tinytest.addAsync('FlowRouter.ready() - specific name', function (test, next) {
  var rand = Random.id();

  FlowRouter.route('/' + rand, {
    action: Function.prototype,
    subscriptions: function () {
      this.subscribe('sub1', Meteor.subscribe('foo'));
    }
  });

  FlowRouter.go('/' + rand);
  setTimeout(function() {
    test.isTrue(FlowRouter.ready('sub1'));
    next();
  }, 100);
});

Tinytest.addAsync('FlowRouter.ready() - without the name', function (test, next) {
  var rand = Random.id();

  FlowRouter.route('/' + rand, {
    action: Function.prototype,
    subscriptions: function () {
      this.subscribe('sub1', Meteor.subscribe('foo'));
    }
  });

  FlowRouter.go('/' + rand);
  setTimeout(function() {
    test.isTrue(FlowRouter.ready());
    next();
  }, 100);
});

Tinytest.addAsync('FlowRouter.ready() - multiples names', function (test, next) {
  var rand = Random.id();

  FlowRouter.route('/' + rand, {
    action: Function.prototype,
    subscriptions: function () {
      this.subscribe('sub1', Meteor.subscribe('foo'));
      this.subscribe('sub2', Meteor.subscribe('foo'));
    }
  });

  FlowRouter.go('/' + rand);
  setTimeout(function() {
    test.isTrue(FlowRouter.ready('sub1', 'sub2'));
    next();
  }, 100);
});

Tinytest.addAsync('FlowRouter.ready() - invalid subname', function (test, next) {
  var rand = Random.id();

  FlowRouter.route('/' + rand, {
    action: Function.prototype,
    subscriptions: function () {
      this.subscribe('sub1', Meteor.subscribe('foo'));
    }
  });

  FlowRouter.go('/' + rand);
  setTimeout(function() {
    test.isFalse(FlowRouter.ready('sub-not-available'));
    next();
  }, 100);
});

Tinytest.addAsync('FlowRouter.ready() - not ready one', function (test, next) {
  var rand = Random.id();

  FlowRouter.route('/' + rand, {
    action: Function.prototype,
    subscriptions: function () {
      this.subscribe('sub1', Meteor.subscribe('readyness', true));
      this.subscribe('sub2', Meteor.subscribe('readyness', false));
    }
  });

  FlowRouter.go('/' + rand);
  setTimeout(function() {
    test.isTrue(FlowRouter.ready('sub1'));
    test.isFalse(FlowRouter.ready('sub2'));
    next();
  }, 100);
});