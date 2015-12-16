if (Package['meteorhacks:fast-render']) {
  FastRender = Package['meteorhacks:fast-render'].FastRender;

  // hack to run after eveything else on startup
  Meteor.startup(() => {
    Meteor.startup(() => {
      setupFastRender();
    });
  });
}

function setupFastRender() {
  FlowRouter._routes.forEach((route) => {
    FastRender.route(route.pathDef, (routeParams, path) => {
      // anyone using Meteor.subscribe for something else?
      const original = Meteor.subscribe;
      Meteor.subscribe = (...args) => {
        return _.toArray(args);
      };

      route._subsMap = {};
      FlowRouter.subscriptions.call(route, path);
      if (route.subscriptions) {
        const queryParams = routeParams.query;
        const params = _.omit(routeParams, 'query');
        route.subscriptions(params, queryParams);
      }
      route._subsMap.forEach((args) => {
        this.subscribe(...args);
      });

      // restore Meteor.subscribe, ... on server side
      Meteor.subscribe = original;
    });
  });
}
