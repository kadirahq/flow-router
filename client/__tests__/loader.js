describe('Loader', () => {
  context('Client', () => {
    it('should load page.js', () => {
      expect(!!FlowRouter._page).to.be.equal(true);
      expect(!!window.page).to.be.equal(false);
    });
  });
});
