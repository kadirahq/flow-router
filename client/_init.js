// Initialize FlowRouter
Meteor.startup(() => {
  if (!FlowRouter._askedToWait) {
    FlowRouter.initialize();
  }
});
