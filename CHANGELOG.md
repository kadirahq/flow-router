# Change Log

### v1.16.0

* [Refactor](https://github.com/meteorhacks/flow-router/pull/172) triggers API for clean code
* Added [redirect](https://github.com/meteorhacks/flow-router#redirecting-with-triggers) functionality for triggers
* Now we are API complete with Flow Router 2.x

### v1.15.0

* Now all our routes are idempotent.
* If some one needs to re-run the route, he needs to use our `FlowRouter.reload()` API.

### v1.14.1

* Fix regression came from v1.11.0. With that, `FlowRouter.go("/")` does not work. More information on [#147](https://github.com/meteorhacks/flow-router/issues/147).

### v1.14.0
* Bring browserify back with the updated version of `cosmos:browserify` which fixes some size issues. See [more info](https://github.com/meteorhacks/flow-router/issues/128#issuecomment-109799953).

### v1.13.0
* Remove browserified pagejs and qs dependancy loading. With that we could reduce ~10kb of data size. (without compression) We can look for a bower integration future. For now, here are the dependancies we have.
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

This relase comes with improvements to the reactive API.

* Fixed [#77](https://github.com/meteorhacks/flow-router/issues/77), [#85](https://github.com/meteorhacks/flow-router/issues/85), [#95](https://github.com/meteorhacks/flow-router/issues/95), [#96](https://github.com/meteorhacks/flow-router/issues/96), [#103](https://github.com/meteorhacks/flow-router/issues/103)
* Add a new API called `FlowRouter.watchPathChange()`
* Deprecated `FlowRouter.reactiveCurrent()` in the favour of `FlowRouter.watchPathChange()`
