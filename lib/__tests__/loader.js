describe('Loader', () => {
  context('Common', () => {
    it('should create FlowRouter', () => {
      expect(!!FlowRouter).to.be.equal(true);
    });

    it('should load query.js', () => {
      expect(!!FlowRouter._qs).to.be.equal(true);
    });
  });
});
