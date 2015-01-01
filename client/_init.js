// Export Router Instance
FlowRouter = new Router;
FlowRouter.Router = Router;
FlowRouter.Route = Route;

FlowRouter.notfound({
  action: function (params) {
    var path = params[0];
    throw new Error('FlowRouter: Route not found ' + path);
  }
});

// Initialize FlowRouter
Meteor.startup(function () {
  FlowRouter.initialize();
});
