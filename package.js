Package.describe({
  name: 'meteorhacks:flow-router',
  summary: 'Router for Flow Architecture',
  version: '1.0.0',
  git: 'https://github.com/meteorhacks/flow-router.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.export('FlowRouter');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('meteorhacks:flow-router');
});
