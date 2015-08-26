Package.describe({
  name: 'kadira:flow-router',
  summary: 'Carefully Designed Client Side Router for Meteor',
  version: '2.3.0',
  git: 'https://github.com/kadirahq/flow-router.git'
});

Npm.depends({
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
  api.use('http');
  api.use('practicalmeteor:sinon');
  api.use('meteorhacks:fast-render');
  api.use('meteorhacks:inject-data');
  api.use('tmeasday:html5-history-api');

  api.addFiles('test/common/fast_render_route.js', ['client', 'server']);

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

  api.addFiles('test/server/plugins/fast_render.js', 'server');

  api.addFiles('test/common/router.path.spec.js', ['client', 'server']);
  api.addFiles('test/common/router.addons.spec.js', ['client', 'server']);
  api.addFiles('test/common/route.spec.js', ['client', 'server']);
});

function configure(api) {
  api.versionsFrom('1.0');

  api.use('underscore');
  api.use('tracker');
  api.use('reactive-dict');
  api.use('reactive-var');

  api.use('meteorhacks:fast-render@2.3.2', ['client', 'server'], {weak: true});
  api.use('cosmos:browserify@0.5.0', 'client');

  api.addFiles('client.browserify.js', 'client');
  api.addFiles('client/triggers.js', 'client');
  api.addFiles('client/router.js', 'client');
  api.addFiles('client/group.js', 'client');
  api.addFiles('client/route.js', 'client');
  api.addFiles('client/_init.js', 'client');

  api.addFiles('server/router.js', 'server');
  api.addFiles('server/group.js', 'server');
  api.addFiles('server/route.js', 'server');
  api.addFiles('server/_init.js', 'server');

  api.addFiles('server/plugins/fast_render.js', 'server');
}
