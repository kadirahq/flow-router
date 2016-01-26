Package.describe({
  name: 'kadira:flow-router-ssr',
  summary: 'Same as kadira:flow-router, but with SSR support',
  version: '3.9.0',
  git: 'https://github.com/kadirahq/flow-router.git'
});

Npm.depends({
  deepmerge: '0.2.10',
  'cookie-parser': '1.4.0',
  cheerio: '0.19.0',
  // In order to support IE9, we had to fork pagejs and apply
  // this PR: https://github.com/visionmedia/page.js/pull/288
  page: 'https://github.com/kadirahq/page.js/archive/34ddf45ea8e4c37269ce3df456b44fc0efc595c6.tar.gz',
  qs: '5.2.0',
  'path-to-regexp': '1.2.1'
});

Package.onUse(function(api) {
  configure(api);
  api.export('FlowRouter');
});

Package.onTest(function(api) {
  configure(api);
  api.use('tinytest');
  api.use('check');
  api.use('mongo');
  api.use('minimongo');
  api.use('http');
  api.use('random');
  api.use('practicalmeteor:sinon');
  api.use('meteorhacks:fast-render');
  api.use('meteorhacks:inject-data');
  api.use('tmeasday:html5-history-api');
  api.use('smithy:describe@1.0.0');

  api.addFiles('test/client/_helpers.js', 'client');
  api.addFiles('test/server/_helpers.js', 'server');

  api.addFiles('test/client/router.core.spec.js', 'client');
  api.addFiles('test/client/router.reactivity.spec.js', 'client');
  api.addFiles('test/client/trigger.spec.js', 'client');
  api.addFiles('test/client/triggers.js', 'client');

  api.addFiles('test/common/loader.spec.js', ['client', 'server']);
  api.addFiles('test/common/router.path.spec.js', ['client', 'server']);
  api.addFiles('test/common/router.url.spec.js', ['client', 'server']);
  api.addFiles('test/common/router.addons.spec.js', ['client', 'server']);
  api.addFiles('test/common/route.spec.js', ['client', 'server']);
  api.addFiles('test/common/group.spec.js', ['client', 'server']);

  api.addFiles('server/__tests__/ssr_context.js', 'server');
  api.addFiles('server/__tests__/route.js', 'server');
  api.addFiles('server/plugins/__tests__/ssr_data.js', 'server');

  api.addFiles('lib/__tests__/group.js', ['client', 'server']);
});

function configure(api) {
  api.versionsFrom('1.2');

  api.use('ecmascript');
  api.use('underscore');
  api.use('tracker');
  api.use('reactive-dict');
  api.use('reactive-var');
  api.use('ddp');
  api.use('ejson');
  api.use('meteorhacks:fast-render@2.11.0', ['client', 'server']);
  api.use('cosmos:browserify@0.9.2', 'client');
  api.use('meteorhacks:picker@1.0.3', 'server');
  api.use('meteorhacks:inject-data@1.4.1');

  api.addFiles('lib/router.js', ['client', 'server']);
  api.addFiles('lib/group.js', ['client', 'server']);
  api.addFiles('lib/route.js', ['client', 'server']);

  api.addFiles('client.browserify.js', 'client');
  api.addFiles('client/triggers.js', 'client');
  api.addFiles('client/router.js', 'client');
  api.addFiles('client/group.js', 'client');
  api.addFiles('client/route.js', 'client');

  api.addFiles('server/router.js', 'server');
  api.addFiles('server/group.js', 'server');
  api.addFiles('server/route.js', 'server');
  api.addFiles('server/ssr_context.js', 'server');

  api.addFiles('lib/_init.js', ['client', 'server']);
  api.addFiles('client/_init.js', 'client');
  api.addFiles('server/_init.js', 'server');

  api.addFiles('server/plugins/ssr_data.js', 'server');
}
