ClientRouter = {};

ClientRouter.route = function (path, options) {
  console.log('> adding client route', path, options);
}

ClientRouter.setState = function (name, value) {
  console.log('> settings route state', name, value);
}

ClientRouter.middleware = function (middleware, options) {
  console.log('> adding global middleware', middleware, options);
}
