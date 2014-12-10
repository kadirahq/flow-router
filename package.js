Package.describe({
  name: 'meteorhacks:flow-router',
  summary: 'Router for Flow Architecture',
  version: '1.0.0',
  git: 'https://github.com/meteorhacks/flow-router.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('tracker');
  api.addFiles('client/client-router.js', 'client');
  api.addFiles('common/flow-route.js');
  api.addFiles('common/flow-router.js');
  api.export('FlowRouter');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('meteorhacks:flow-router');
  api.addFiles('tests/flow-route.test.js');
  api.addFiles('tests/flow-router.test.js');
});
