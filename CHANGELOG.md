# Changelog

### v3.13.0
2016-04-22

* Use FastRender 2.14.0

### v3.12.2
2016-03-17

* Fix all failing tests. It seems like Meteor 1.3 RC doesn't like the spread operator. See: [PR564](https://github.com/kadirahq/flow-router/pull/564)

### v3.12.1
2016-03-17

* Publish with npm modules

### v3.12.0
2016-03-17

* Add Support for METEOR@1.3-rc.1.
* Currently, some tests are failing for no reason. But, still a good idea to release for testing. That's why we ship this.

### v3.11.2
2016-03-03

* Update fast-render to 2.13.0. This version comes with much better implementation for the publication context. It's now more like Meteor.

### v3.11.1
2016-02-23

* Delay handling of back button with PR [538](https://github.com/kadirahq/flow-router/pull/538). Fixes [#536](https://github.com/kadirahq/flow-router/issues/536)

### v3.11.0
2016-02-19

* Update FastRender and InjectData(to 2.x). This is to support Meteor 1.3. To do that, we had to change the InjectData api a bit and release it as 2.0.0.

### v3.10.0
* Add userId into the page cache logic. So, now a page is cache key is generate using the userId and the url. So, now there won't be data leaks with caching

### v3.9.4

* Use a pure JS URL parser

### v3.9.3

* Remove hash from the client side routing logic. Fixes: [519](https://github.com/kadirahq/flow-router/issues/519)

### v3.9.2

* Fix URL generation for prefixed paths. See: [#514](https://github.com/kadirahq/flow-router/pull/514)

### v3.9.1

* Fix issue [#505](https://github.com/kadirahq/flow-router/issues/505) which cause errors on babel5 (Meteor 1.3-update-5)

### v3.9.0

* Use path-to-regexp to compile paths. See: [#499](https://github.com/kadirahq/flow-router/pull/499)

### v3.8.3

* Fix ignore navigation to external links

### v3.8.2

* Fix issues is handling optional params. See: [#495](https://github.com/kadirahq/flow-router/issues/495)

### v3.8.1

* Handle the back button properly.

### v3.8.0

* Remove page.js dependancy and implement an inbuild routing system.

### v3.7.3

* Make caching a page idempotant. Fix issues like this. [See](https://github.com/arunoda/hello-react-meteor/issues/13)
* Disable caching by default.

### v3.7.2
* Add _serverRequest to the context in server side. It's current request's HTTP request object. You can get more information from if needed. See: [#414](https://github.com/kadirahq/flow-router/pull/414)

### v3.7.1
* Fix a bug related to head injection. See: [#434](https://github.com/kadirahq/flow-router/pull/434)

### v3.7.0

* Remove subscription registration from the router
* Remove internal tracker and apply route changes immediately. With this change, we don't use `Track.flush()`. That'll fix a lot of runtime issues.
* Code is now written ES2015.
* A lot of refactoring in the code base for SSR and isomorphich functionalities.

### v3.6.0
* Get features from v2.9.0

### v3.5.0

* Get changes from master upto v2.7.0
* Add support for path prefix for SSR

### v3.4.0

* Now, React root node generation done outside of the router. It's handle by the ReactLayout. **This is a breaking change and need to update ReactLayout**

### v3.3.0
* Get changes from FlowRouter 2.6.0
* Add complete queryParams support in SSR. Fixes: [#237](https://github.com/kadirahq/flow-router/issues/237)

### v3.2.1
* Fix adding support for unicode chars in the head

### v3.2.0
* Upgrade FastRender for Meteor 1.2 support

### v3.1.0
* Support null publications and custom publications with `this.xxx` apis
* Support server side login state
* Get the changes from v2.1.1

### v3.0.1
* Add initial SSR support
* It's implemented as extendable manner. Currently ReactLayout supports it.

### v2.10.1
* Fix the url generation for prefixed paths. See: [#508](https://github.com/kadirahq/flow-router/issues/508)

### v2.10.0
* Update few dependencies to the latest versions: pagejs, qs, cosmos:browserify

### v2.9.0
* Add FlowRouter.url() See: [#374](https://github.com/kadirahq/flow-router/pull/374)

### v2.8.0
* Allow to access options in groups as well. See: [#378](https://github.com/kadirahq/flow-router/pull/378)

### v2.7.0
* Add Path Prefix support. See: [#329](https://github.com/kadirahq/flow-router/pull/329)

### v2.6.2
* Now .current() sends a cloned version of the internal current object. Which prevent outside mutations to params and queryParams

### v2.6.1

* Fix [#143](https://github.com/kadirahq/flow-router/issues/314).
  This says that when we are doing a trigger redirect,
  We won't get reactive changes like: `getRouteName()`

### v2.6.0
* Add hashbang support. See [#311](https://github.com/kadirahq/flow-router/pull/311)

### v2.5.0
* Add a stop callback on the triggers. See: [#306](https://github.com/kadirahq/flow-router/pull/306).

### v2.4.0

* Add a name to the route groups. See: [#290](https://github.com/kadirahq/flow-router/pull/290)

### v2.3.0
* We've used `path` for both the current path and for the pathDef earlier. Now we differentiate it. See: [#272](https://github.com/kadirahq/flow-router/issues/272) and [#273](https://github.com/kadirahq/flow-router/pull/273) for more information.

### v2.2.0
* Add the first addOn api: FlowRouter.onRouteRegister(cb)

### v2.1.1
* There was an issue in IE9 support. We fix it with this version.

### v2.1.0
* Add IE9 Support. See this issue [#111](https://github.com/kadirahq/flow-router/issues/111) for more info.

### v2.0.2

* Add missing queryParams object in the subscriptions method (with FR on the server)
* With that, [#237](https://github.com/kadirahq/flow-router/issues/237) is partially fixed.

### v2.0.1

* Use pagejs.redirect() for our redirection process.
* Above fixes [#239](https://github.com/kadirahq/flow-router/issues/239)

### v2.0.0

* Released 2.0  :)
* Now flow-router comes as `kadira:flow-router`
* Remove deprecated APIs
    - `FlowRouter.reactiveCurrent()`
    - Middlewares
    - `FlowRouter.current().params.query`
* Follow the [migration guide](https://github.com/kadirahq/flow-router#migrating-into-20) for more information.

### v1.18.0

* Implement idempotent routing on withReplaceState. See: [#197](https://github.com/meteorhacks/flow-router/issues/197)
* Add an [API](https://github.com/meteorhacks/flow-router#flowrouterwithtrailingslashfn) to set trailing slashes.

### v1.17.2
* Fix [#182](https://github.com/meteorhacks/flow-router/issues/182) - Now trigger's redirect function support `FlowRouter.go()` syntax.

### v1.17.1

* Fix [#164](https://github.com/meteorhacks/flow-router/issues/164) - It's an issue when using `check` with flow router query params.
* Fix [#168](https://github.com/meteorhacks/flow-router/pull/168) - It's URL encoding issue.

### v1.17.0

* Add an API called `FlowRouter.wait()` to wait the initialization and pass it back to the app. Fixes issue [180](https://github.com/meteorhacks/flow-router/issues/180).

### v1.16.3

* Fix a crazy context switching issue. For more information see commit [6ca54cc](https://github.com/meteorhacks/flow-router/commit/6ca54cc7969b3a8aa71d63c98c99a20b175125a2)

### v1.16.2
* Fix issue [#167](https://github.com/meteorhacks/flow-router/issues/167) via [#175](https://github.com/meteorhacks/flow-router/pull/175)
* Fix [#176](https://github.com/meteorhacks/flow-router/issues/176) by the removal of `Tracker.flush` usage.

### v1.16.1
* Fix [issue](https://github.com/meteorhacks/flow-router/pull/173) of overwriting global triggers when written multiple times.

### v1.16.0

* [Refactor](https://github.com/meteorhacks/flow-router/pull/172) triggers API for clean code
* Added [redirect](https://github.com/meteorhacks/flow-router#redirecting-with-triggers) functionality for triggers
* Now we are API complete for the 2.x release

### v1.15.0

* Now all our routes are idempotent.
* If some one needs to re-run the route, he needs to use our `FlowRouter.reload()` API.

### v1.14.1

* Fix regression came from v1.11.0. With that, `FlowRouter.go("/")` does not work. More information on [#147](https://github.com/meteorhacks/flow-router/issues/147).

### v1.14.0
* Bring browserify back with the updated version of `cosmos:browserify` which fixes some size issues. See [more info](https://github.com/meteorhacks/flow-router/issues/128#issuecomment-109799953).

### v1.13.0
* Remove browserified pagejs and qs dependency loading. With that we could reduce ~10kb of data size (without compression). We can look for a bower integration in the future. For now, here are the dependencies we have.
    - page@1.6.3: https://github.com/visionmedia/page.js
    - qs@3.1.0: https://github.com/hapijs/qs

### v1.12.0
* Add [`FlowRouter.withReplaceState`](https://github.com/meteorhacks/flow-router#flowrouterwithreplcaestatefn) api to use replaceState when changing routes via FlowRouter apis.

### v1.11.0
* Fix [#145](https://github.com/meteorhacks/flow-router/issues/145) by changing how safeToRun works.
* Add `FlowRouter.path()` to the server side
* Fix [#130](https://github.com/meteorhacks/flow-router/issues/130)

### v1.10.0
Add support for [triggers](https://github.com/meteorhacks/flow-router#triggers). This is something similar to middlewares but not as middlewares. Visit [here](https://github.com/meteorhacks/flow-router/pull/59) to learn about design decisions.

_**Now, middlewares are deprecated.**_

### v1.9.0
Fix [#120](https://github.com/meteorhacks/flow-router/issues/120) and added callback support for `FlowRouter.subsReady()`.

### v1.8.0

This release comes with improvements to the reactive API.

* Fixed [#77](https://github.com/meteorhacks/flow-router/issues/77), [#85](https://github.com/meteorhacks/flow-router/issues/85), [#95](https://github.com/meteorhacks/flow-router/issues/95), [#96](https://github.com/meteorhacks/flow-router/issues/96), [#103](https://github.com/meteorhacks/flow-router/issues/103)
* Add a new API called `FlowRouter.watchPathChange()`
* Deprecated `FlowRouter.reactiveCurrent()` in the favour of `FlowRouter.watchPathChange()`
