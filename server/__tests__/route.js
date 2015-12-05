describe('Route', () => {
  context('page Caching', () => {
    context('new page', () => {
      it('should be able to cache the page and get it back', () => {
        const route = new Route();
        const pageInfo = {aa: 10};
        route._cachePage('/the-url', pageInfo, 100);
        expect(route._getCachedPage('/the-url')).to.be.deep.equal(pageInfo);
      });

      it('should expire the page after a timeout', () => {
        const route = new Route();
        const pageInfo = {aa: 10};
        route._cachePage('/the-url', pageInfo, 100);
        Meteor._sleepForMs(200);
        expect(route._getCachedPage('/the-url')).to.be.null;
      });
    });

    context('exiting page', () => {
      it('should throw an error when trying to cache again', () => {
        const route = new Route();
        const pageInfo = {aa: 10};
        const cachePage = () => route._cachePage('/the-url', pageInfo, 100);
        cachePage();
        expect(cachePage).to.throw(/Cannot cache a existing cahced page/);
      });
    });
  });

  context('._isHtmlPage', () => {
    context('no extention', () => {
      context('should be true', () => {
        const route = new Route();
        const isHtml = route._isHtmlPage('/anc/sds');
        expect(isHtml).to.be.true;
      });
    });

    context('has an extention', () => {
      context('starts with "htm"', () => {
        it('should be true', () => {
          const route = new Route();
          const isHtml = route._isHtmlPage('/anc/sds/aa.htm');
          expect(isHtml).to.be.true;
        });
      });

      context('otherwise', () => {
        it('should be true', () => {
          const route = new Route();
          const isHtml = route._isHtmlPage('/anc/sds/aa.htm');
          expect(isHtml).to.be.true;
        })
      });
    });
  });
});