Tinytest.add('Common - Group - expose group options', function(test) {
  var pathDef = '/' + Random.id();
  var name = Random.id();
  var data = {aa: 10};
  var layout = 'blah';

  var group = FlowRouter.group({
    name: name,
    prefix: '/admin',
    layout: layout,
    someData: data
  });

  test.equal(group.options.someData, data);
  test.equal(group.options.layout, layout);
});

Tinytest.add('Common - Group - validate path definition', function(test, next) {
  // path & prefix must start with '/'
  test.throws(function() {
    new Group(null, {prefix: Random.id()});
  });

  var group = FlowRouter.group({prefix: '/' + Random.id()});

  test.throws(function() {
    group.route(Random.id());
  });
});

Tinytest.add('Common - Group - expose group options on a route', function(test) {
  var pathDef = '/' + Random.id();
  var name = Random.id();
  var groupName = Random.id();
  var data = {aa: 10};
  var layout = 'blah';

  var group = FlowRouter.group({
    name: groupName,
    prefix: '/admin',
    layout: layout,
    someData: data
  });

  group.route(pathDef, {
    name: name
  });

  var route = FlowRouter._routesMap[name];

  test.equal(route.group.options.someData, data);
  test.equal(route.group.options.layout, layout);
});
