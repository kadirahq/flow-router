Package.describe({
  name: 'meteorhacks:flow-router',
  summary: 'Router for Flow Architecture',
  version: '1.0.0',
  git: 'https://github.com/meteorhacks/flow-router.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('reactive-dict');
  api.addFiles('client/client-router.js', 'client');
  api.addFiles('client/flow-router.js', 'client');
  api.addFiles('server/flow-router.js', 'server');
  api.export('FlowRouter');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('reactive-dict');
  api.use('meteorhacks:flow-router');
  api.addFiles('tests/client/flow-router.test.js', 'client');
  api.addFiles('tests/server/flow-router.test.js', 'server');
});
