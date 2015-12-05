Tinytest.add('Common - import query.js', function(test) {
  test.isTrue(!!FlowRouter._qs);
});

Tinytest.add('Common - create FlowRouter', function(test) {
  test.isTrue(!!FlowRouter);
});
