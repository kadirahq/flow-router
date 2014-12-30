Meteor.publish('foo', function () {
  this.ready();
})

Meteor.publish('bar', function () {
  this.ready();
})

Meteor.publish('readyness', function (doIt) {
  if(doIt) {
    this.ready();
  }
})
