var deepMerge = Npm.require('deepmerge');

SsrContext = function() {
  this._html = "";
  this._head = "";
  this._collections = {};
};

SsrContext.prototype.getCollection = function(collName) {
  var collection = this._collections[collName];
  if(!collection) {
    var minimongo = Package['minimongo'];
    collection = this._collections[collName] = new minimongo.LocalCollection();
  }

  return collection;
};

SsrContext.prototype.setHtml = function(html) {
  this._html = html;
};

SsrContext.prototype.getHtml = function() {
  return this._html;
};

SsrContext.prototype.addToHead = function(headHtml) {
  this._head += '\n' + headHtml;
};

SsrContext.prototype.getHead = function() {
  return this._head;
};

SsrContext.prototype.addSubscription = function(name, params) {
  var self = this;
  var pub = Meteor.default_server.publish_handlers[name];
  var fastRenderContext = FastRender.frContext.get();
  var args = [name].concat(params);
  var data = fastRenderContext.subscribe.apply(fastRenderContext, args);

  _.each(data, function(collDataCollection, collectionName) {
    var collection = self.getCollection(collectionName);
    collDataCollection.forEach(function(collData) {
      collData.forEach(function(item) {
        var existingDoc = collection.findOne(item._id);
        if(existingDoc) {
          var newDoc = deepMerge(existingDoc, item);
          delete newDoc._id;
          collection.update(item._id, newDoc);
        } else {
          collection.insert(item);
        }
      });
    });
  });
};