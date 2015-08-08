Package.describe({
  name: 'kadira:flow-router-ssr',
  summary: 'Same as kadira:flow-router, but with SSR support',
  version: '3.0.0',
  git: 'https://github.com/kadirahq/flow-router.git'
});

Npm.depends({
  'deepmerge': '0.2.10',
  "connect": "2.13.0",
  'cheerio': '0.19.0',
  // In order to support IE9, we had to fork pagejs and apply
  // this PR: https://github.com/visionmedia/page.js/pull/288
  'page':'https://github.com/kadirahq/page.js/archive/f29d4d4491178b285b9058c32d74975a4f945dea.tar.gz',
  'qs':'3.1.0'
});

Package.onUse(function(api) {
  configure(api);
  api.export('FlowRouter');
});

Package.onTest(function(api) {
  configure(api);
  api.use('tinytest');
  api.use('mongo');
  api.use('minimongo');
  api.use('http');
  api.use('practicalmeteor:sinon');
  api.use('meteorhacks:fast-render');
  api.use('meteorhacks:inject-data');
  api.use('tmeasday:html5-history-api');


  api.addFiles('test/client/_helpers.js', 'client');
  api.addFiles('test/server/_helpers.js', 'server');

  api.addFiles('test/client/loader.spec.js', 'client');
  api.addFiles('test/client/route.reactivity.spec.js', 'client');
  api.addFiles('test/client/router.core.spec.js', 'client');
  api.addFiles('test/client/router.subs_ready.spec.js', 'client');
  api.addFiles('test/client/router.reactivity.spec.js', 'client');
  api.addFiles('test/client/group.spec.js', 'client');
  api.addFiles('test/client/trigger.spec.js', 'client');
  api.addFiles('test/client/triggers.js', 'client');
  
  api.addFiles('test/common/router.path.spec.js', ['client', 'server']);
  api.addFiles('test/common/route.spec.js', ['client', 'server']);
});

function configure(api) {
  api.versionsFrom('1.0');

  api.use('underscore');
  api.use('tracker');
  api.use('reactive-dict');
  api.use('reactive-var');

  api.use('meteorhacks:fast-render@2.8.1', ['client', 'server']);
  api.use('cosmos:browserify@0.5.0', 'client');
  api.use('meteorhacks:picker@1.0.3', 'server');
  api.use('meteorhacks:inject-data@1.3.0');

  api.addFiles('client.browserify.js', 'client');
  api.addFiles('client/triggers.js', 'client');
  api.addFiles('client/router.js', 'client');
  api.addFiles('client/group.js', 'client');
  api.addFiles('client/route.js', 'client');
  api.addFiles('client/_init.js', 'client');

  api.addFiles('server/router.js', 'server');
  api.addFiles('server/group.js', 'server');
  api.addFiles('server/route.js', 'server');
  api.addFiles('server/ssr_context.js', 'server');
  api.addFiles('server/_init.js', 'server');

  api.addFiles('server/plugins/ssr_data.js', 'server');
}