if(!Package['meteorhacks:fast-render']) return;

Meteor.startup(function () {
  Meteor.startup(function () {
    setupFastRender();
  })
});

function setupFastRender () {
  _.each(FlowRouter._routeMap, function (route, routeName) {
    FastRender.route(routeName, function (params, path) {
      var self = this;

      // anyone using Meteor.subscribe for something else?
      var original = Meteor.subscribe;
      Meteor.subscribe = function () {
        return _.toArray(arguments);
      };

      route._subsMap = {};
      route.subscriptions(params);
      _.each(route._subsMap, function (args) {
        self.subscribe.apply(self, args);
      });

      // restore Meteor.subscribe, ... on server side
      Meteor.subscribe = original;
    });
  });
}
