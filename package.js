Package.describe({
  name: 'meteorhacks:flow-router',
  summary: 'Carefully Designed Client Side Router for Meteor',
  version: '1.7.1',
  git: 'https://github.com/meteorhacks/flow-router.git'
});

Npm.depends({
  'page':'1.6.3',
    'qs':'2.4.1'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use('underscore');
  api.use('tracker');
  api.use('reactive-dict');
  api.use('reactive-var');

  api.use('meteorhacks:fast-render@2.3.2', ['client', 'server'], {weak: true});
  api.use('cosmos:browserify@0.1.3', 'client');

  api.addFiles('browserify.js', 'client');
  api.addFiles('client/router.js', 'client');
  api.addFiles('client/group.js', 'client');
  api.addFiles('client/route.js', 'client');
  api.addFiles('client/_init.js', 'client');
  api.addFiles('server/router.js', 'server');
  api.addFiles('server/group.js', 'server');
  api.addFiles('server/route.js', 'server');
  api.addFiles('server/_init.js', 'server');

  api.addFiles('server/plugins/fast_render.js', 'server');

  api.export('FlowRouter');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('mongo');
  api.use('http');
  api.use('meteorhacks:flow-router');
  api.use('practicalmeteor:sinon');
  api.use('meteorhacks:fast-render');
  api.use('meteorhacks:inject-data');

  api.addFiles('test/common/fast_render_route.js', ['client', 'server']);

  api.addFiles('test/client/_helpers.js', 'client');
  api.addFiles('test/server/_helpers.js', 'server');

  api.addFiles('test/client/loader.spec.js', 'client');
  api.addFiles('test/client/router.spec.js', 'client');
  api.addFiles('test/client/router.subs_ready.spec.js', 'client');
  api.addFiles('test/client/router.naming.spec.js', 'client');
  api.addFiles('test/client/route.test.js', 'client');
  api.addFiles('test/client/route.spec.js', 'client');
  api.addFiles('test/client/group.spec.js', 'client');

  api.addFiles('test/server/plugins/fast_render.js', 'server');
});
