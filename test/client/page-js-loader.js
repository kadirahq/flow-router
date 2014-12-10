Tinytest.add('Page.js - load page.js', function (test) {
  test.isTrue(!!FlowRouter.PageJS);
  test.isFalse(!!window.page);
});
