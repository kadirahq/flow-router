Package.describe({
  name: 'meteorhacks:flow-router',
  summary: 'Router for Flow Architecture',
  version: '1.0.0',
  git: 'https://github.com/meteorhacks/flow-router.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('tracker');
  api.use('reactive-var');
  api.addFiles('client/page.js', 'client');
  api.addFiles('client/query.js', 'client');
  api.addFiles('client/loader.js', 'client');
  api.addFiles('client/route.js', 'client');
  api.addFiles('client/router.js', 'client');
  api.export('FlowRouter');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('meteorhacks:flow-router');
  api.addFiles('test/_utils/server.js', 'server');
  api.addFiles('test/_utils/client.js', 'client');
  api.addFiles('test/client/router.js', 'client');
});
