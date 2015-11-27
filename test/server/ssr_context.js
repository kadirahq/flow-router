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


Tinytest.addAsync(
'SSR Context - body - should add and get body',
function(test, done) {
  var ssrContext = new SsrContext();

  var html1 = "<p>Sample <em>Html</em> Strings</p>";
  ssrContext.setHtml(html1);
  var html2 = ssrContext.getHtml();

  test.equal(html1, html2);
  done();
});

Tinytest.addAsync(
'SSR Context - body - should override existing body',
function(test, done) {
  var ssrContext = new SsrContext();

  var body = '<p>Sample <em>Html</em> Strings</p>';
  ssrContext.setHtml(body);
  var existingBody = ssrContext.getHtml();

  test.equal(body, existingBody);

  var bodyToOverride = '<div>Demo HTML Content</div>';
  ssrContext.setHtml(bodyToOverride);
  var existingBody = ssrContext.getHtml();

  test.equal(bodyToOverride, existingBody);
  done();
});

Tinytest.addAsync(
'SSR Context - head - should get the existing head',
function(test, done) {
  var ssrContext = new SsrContext();

  var headHtml = '<h1>Head</h1>';
  ssrContext.addToHead(headHtml);
  var existingHead = ssrContext.getHead();
  var expectedHead = '\n' + headHtml;

  test.equal(expectedHead, existingHead);
  done();
});

Tinytest.addAsync(
'SSR Context - head - should append to the existing head',
function(test, done) {
  var ssrContext = new SsrContext();

  var headHtml = '<h1>Head</h1>';
  ssrContext.addToHead(headHtml);
  var existingHead = ssrContext.getHead();
  var expectedHead = '\n' + headHtml;
  
  test.equal(expectedHead, existingHead);

  var headHtmlToAppend = '<h2>Head 2</h2>';
  ssrContext.addToHead(headHtmlToAppend);
  var existingHead = ssrContext.getHead();
  var expectedHead = expectedHead + '\n' + headHtmlToAppend;

  test.equal(expectedHead, existingHead);

  done();
});