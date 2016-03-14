// This is a magic configuration in Meteor which allows some apps to be
// run with a prefix.
// This is very important when especially app running in something like
// sandstrom.io
// Now it's supported by SSR using this
FlowRouter.basePath = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';
