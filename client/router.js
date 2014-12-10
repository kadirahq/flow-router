FlowRouter = {
  _current: new ReactiveVar,
  _routeMap: {},
  _middleware: [],
};

// @api
FlowRouter.route = function (path, options) {
  var self = this;
  var route = self._routeMap[path] = new FlowRoute(path, options);

  page(path, function (context, next) {
    next();
    self._current.set(path);
    route.render(context.params);
  });

  return route;
}


FlowRouter.go = function (path) {
  page(path);
}


FlowRouter.middleware = function (middlewareFn) {
  page(function (ctx, next) {
    middlewareFn(ctx.pathname, next);
  });
}


FlowRouter.setState = function (name, value) {
  var query = qs.parse(location.search.slice(1));
  query[name] = value;
  history.pushState({}, "", location.pathname + '?' + qs.stringify(query));
}


FlowRouter.getState = function (name) {
  var query = qs.parse(location.search.slice(1));
  return query[name];
}


// run current route subs
Tracker.autorun(function () {
  var path = FlowRouter._current.get();
  var route = FlowRouter._routeMap[path];
  route && route.subscriptions();
})


// query string middleware
page(function (ctx, next) {
  // wait for `location` variable to update
  setTimeout(function() {
    var queryStr = location.search.slice(1);
    ctx.params.query = qs.parse(queryStr);
    next();
  }, 0);
});
