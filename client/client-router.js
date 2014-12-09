ClientRouter = {};

ClientRouter.route = function (path, options) {
  console.log('> adding client route', path, options);
}

ClientRouter.setState = function (name, value) {
  console.log('> settings route state', name, value);
}
