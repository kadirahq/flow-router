Package.describe({
  name: 'baotuan:flow-router-ssr',
  summary: 'Same as kadira:flow-router, but with SSR support',
  version: '3.13.2',
  git: 'https://github.com/BillTuan/flow-router.git'
})

Package.onUse(function (api) {
  configure(api)
  api.export('FlowRouter')
})

Npm.depends({
  cheerio: '0.19.0',
  'cookie-parser': '1.4.0',
  deepmerge: '0.2.10',
  parseurl: '1.3.1',
  'path-to-regexp': '1.2.1',
  qs: '6.1.0',
  url: '0.11.0'
})

Package.onTest(function (api) {
  configure(api)
  api.use('tinytest')
  api.use('check')
  api.use('mongo')
  api.use('minimongo')
  api.use('http')
  api.use('random')
  // We use accounts-base to get `Meteor.user()`.
  // It's used for page caching.
  api.use('accounts-base')

  api.addFiles('test/_engine/utils.js')
  api.addFiles('test/_engine/describe.js')

  api.addFiles('test/client/_helpers.js', 'client')
  api.addFiles('test/server/_helpers.js', 'server')

  api.addFiles('test/client/router.core.spec.js', 'client')
  api.addFiles('test/client/router.reactivity.spec.js', 'client')
  api.addFiles('test/client/trigger.spec.js', 'client')
  api.addFiles('test/client/triggers.js', 'client')

  api.addFiles('test/common/loader.spec.js', ['client', 'server'])
  api.addFiles('test/common/router.path.spec.js', ['client', 'server'])
  api.addFiles('test/common/router.url.spec.js', ['client', 'server'])
  api.addFiles('test/common/router.addons.spec.js', ['client', 'server'])
  api.addFiles('test/common/route.spec.js', ['client', 'server'])
  api.addFiles('test/common/group.spec.js', ['client', 'server'])

  api.addFiles('server/__tests__/ssr_context.js', 'server')
  api.addFiles('server/__tests__/route.js', 'server')
  api.addFiles('server/plugins/__tests__/ssr_data.js', 'server')

  api.addFiles('lib/__tests__/group.js', ['client', 'server'])
})

function configure (api) {
  api.versionsFrom('METEOR@1.3-rc.1')
  api.use('ecmascript')
  api.use('underscore')
  api.use('tracker')
  api.use('reactive-dict')
  api.use('reactive-var')
  api.use('ddp')
  api.use('ejson')
  api.use('modules', ['client', 'server'])
  api.use('staringatlights:fast-render@2.16.5', ['client', 'server'])
  api.use('meteorhacks:picker@1.0.3', 'server')
  api.use('meteorhacks:inject-data@2.0.0')

  api.addFiles('lib/router.js', ['client', 'server'])
  api.addFiles('lib/group.js', ['client', 'server'])
  api.addFiles('lib/route.js', ['client', 'server'])

  api.addFiles('client/triggers.js', 'client')
  api.addFiles('client/router.js', 'client')
  api.addFiles('client/group.js', 'client')
  api.addFiles('client/route.js', 'client')

  api.addFiles('server/router.js', 'server')
  api.addFiles('server/group.js', 'server')
  api.addFiles('server/route.js', 'server')
  api.addFiles('server/ssr_context.js', 'server')

  api.addFiles('lib/_init.js', ['client', 'server'])
  api.addFiles('client/_init.js', 'client')
  api.addFiles('server/_init.js', 'server')

  api.addFiles('server/plugins/ssr_data.js', 'server')
}
