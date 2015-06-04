# Change Log

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
