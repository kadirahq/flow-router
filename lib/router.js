Router.prototype.url = function() {
  var path = this.path.apply(this, arguments);
  return Meteor.absoluteUrl(path.replace(/^\//, ''));
};
