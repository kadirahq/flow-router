if(!Package['meteorhacks:fast-render']) {
  return;
}

FastRender = Package['meteorhacks:fast-render'].FastRender;

// hack to run after eveything else on startup
Meteor.startup(function () {
  Meteor.startup(function () {
    setupFastRender();
  });
});

function setupFastRender () {
  _.each(FlowRouter._routesMap, function (route, path) {
    FastRender.route(path, function (params, path) {
      var self = this;

      // anyone using Meteor.subscribe for something else?
      var original = Meteor.subscribe;
      Meteor.subscribe = function () {
        return _.toArray(arguments);
      };

      route._subsMap = {};
      FlowRouter.subscriptions.call(route, path);
      if(route.subscriptions) {
        route.subscriptions(params);
      }
      _.each(route._subsMap, function (args) {
        self.subscribe.apply(self, args);
      });

      // restore Meteor.subscribe, ... on server side
      Meteor.subscribe = original;
    });
  });
}
