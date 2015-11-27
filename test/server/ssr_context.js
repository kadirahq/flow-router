Tinytest.addAsync(
'SSR Context - getCollection - should create a collection if there is not',
function(test, done) {
  var ssrContext = new SsrContext();
  var collection = ssrContext.getCollection('collName');

  test.isNotUndefined(collection);
  done();
});

Tinytest.addAsync(
'SSR Context - getCollection - should return the collection already created if exists',
function(test, done) {
  var ssrContext = new SsrContext();
  var collection1 = ssrContext.getCollection('collName1');
  var collection2 = ssrContext.getCollection('collName1');

  test.equal(collection1, collection2);
  done();
});