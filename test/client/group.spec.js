Tinytest.addAsync('Client - Group - define and go to route with prefix', function (test, next) {
  var prefix = Random.id();
  var rand = Random.id();
  var rendered = 0;

  var group = FlowRouter.group({prefix: '/' + prefix});

  group.route('/' + rand, {
    action: function(_params) {
      rendered++;
    }
  });

  FlowRouter.go('/' + prefix + '/' + rand);

  setTimeout(function() {
    test.equal(rendered, 1);
    setTimeout(next, 100);
  }, 100);
});

Tinytest.addAsync('Client - Group - define and go to route without prefix', function (test, next) {
  var rand = Random.id();
  var rendered = 0;

  var group = FlowRouter.group();

  group.route('/' + rand, {
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


Tinytest.addAsync('Client - Group - set and retrieve group name', function (test, next) {
  var rand = Random.id();
  var name = Random.id();

  var group = FlowRouter.group({
    name: name
  });

  group.route('/' + rand);

  FlowRouter.go('/' + rand);
  setTimeout(function() {
    test.equal(FlowRouter.current().route.group.name, name);
    next();
  }, 100);
});