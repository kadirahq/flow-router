Tinytest.add('Client - import page.js', function(test) {
  test.isTrue(!!FlowRouter._page);
  test.isFalse(!!window.page);
});
