// Export Router Instance
FlowRouter = new Router();
FlowRouter.Router = Router;
FlowRouter.Route = Route;

// Initialize FlowRouter
Meteor.startup(function () {
  FlowRouter.initialize();
});
