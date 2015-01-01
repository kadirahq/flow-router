// Export Router Instance
FlowRouter = new Router;
FlowRouter.Router = Router;
FlowRouter.Route = Route;

FlowRouter.notfound(function (params) {
  console.error('# 404', params);
});

// Initialize FlowRouter
Meteor.startup(function () {
  FlowRouter.initialize();
});
