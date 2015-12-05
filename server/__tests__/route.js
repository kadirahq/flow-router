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

  context('._buildContext', () => {
    it('should build the desired context', () => {
      const route = new Route();
      const req = {url: '/the-url'};
      const params = {
        aa: 10, query: {bb: 20}
      };

      const context = route._buildContext(req, params);
      expect(context.route).to.be.equal(route);

      delete context.route;
      expect(context).to.be.deep.equal({
        path: req.url,
        params: {aa: 10},
        queryParams: {bb: 20}
      });
    });
  });

  context('._moveScriptsToBottom', () => {
    it('should move all the scripts tags to bottom of body', () => {
      const inputPage = `
<html>
  <head>
    <title>The Title</title>
    <script type="text/javascript" src="aa.js"></script>
    <script type="text/javascript" src="bb.js"></script>
  </head>

  <body>
    <div id="abc"></div>
  </body>
</html>
      `;

      const expectedPage = `
<html>
  <head>
    <title>The Title</title>
  </head>

  <body>
    <div id="abc"></div>
    <script type="text/javascript" src="aa.js"></script>
    <script type="text/javascript" src="bb.js"></script>
  </body>
</html>
      `;

      const trimIt = str => {
        return str.split('\n').map(line => line.trim()).join('');
      };

      const route = new Route();
      const returnedPage = route._moveScriptsToBottom(trimIt(inputPage));
      expect(trimIt(returnedPage)).to.be.equal(trimIt(expectedPage));
    });
  });
});