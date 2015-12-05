const minifyHtml = str => {
  return str.split('\n').map(line => line.trim()).join('');
};

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

      const route = new Route();
      const returnedPage = route._moveScriptsToBottom(minifyHtml(inputPage));
      expect(minifyHtml(returnedPage)).to.be.equal(minifyHtml(expectedPage));
    });
  });

  context('_injectHtml', () => {
    context('res.write() input data is a string', () => {
      context('always', () => {
        it('should inject head and body taken from the ssrContext', done => {
          const router = {};
          const route = new Route(router);
          const req = {url: '/aaa/aa.html'};
          const res = {
            write: html => {
              const expectedHtml = `
                <html>
                  <head><head-content /></head>
                  <body><body-content /></body>
                </html>
              `;
              expect(minifyHtml(html)).to.be.equal(minifyHtml(expectedHtml));
              done();
            }
          };
          const ssrContext = {
            getHtml: () => '<body-content />',
            getHead: () => '<head-content />'
          };

          route._injectHtml(req, res, ssrContext);
          const inputHtml = `
            <html>
              <head></head>
              <body></body>
            </html>
          `;
          res.write(minifyHtml(inputHtml));
        });
      });

      context('with deferScriptLoading option', () => {
        it('should move scripts to bottom', done => {
          const router = {deferScriptLoading: true};
          const route = new Route(router);
          const req = {url: '/aaa/aa.html'};
          const res = {
            write: html => {
              const expectedHtml = `
                <html>
                  <head></head>
                  <body>
                    <body-content></body-content>
                    <script src="aa.js"></script>
                    <script src="bb.js"></script>
                  </body>
                </html>
              `;
              expect(minifyHtml(html)).to.be.equal(minifyHtml(expectedHtml));
              done();
            }
          };
          const ssrContext = {
            getHtml: () => '<body-content />',
            getHead: () => '<script src="bb.js"></script>'
          };

          route._injectHtml(req, res, ssrContext);
          const inputHtml = `
            <html>
              <head>
                <script src="aa.js"></script>
              </head>
              <body></body>
            </html>
          `;
          res.write(minifyHtml(inputHtml));
        });
      });

      context('with pageCacheTimeout option', () => {
        it('should cache the page the mentioned timeout', done => {
          const router = {pageCacheTimeout: true};
          const route = new Route(router);
          const req = {url: '/aaa/aa.html'};
          const frData = {aa: 10};
          const res = {
            write: html => {
              const expectedHtml = `
                <html>
                  <head><head-content /></head>
                  <body><body-content /></body>
                </html>
              `;
              const cachedPage = route._getCachedPage(req.url);

              expect(minifyHtml(html)).to.be.equal(minifyHtml(expectedHtml));
              expect(minifyHtml(cachedPage.html)).to.be.equal(minifyHtml(expectedHtml));
              expect(cachedPage.frData).to.be.deep.equal(frData);
              done();
            },
            getData: () => frData
          };
          const ssrContext = {
            getHtml: () => '<body-content />',
            getHead: () => '<head-content />'
          };

          route._injectHtml(req, res, ssrContext);
          const inputHtml = `
            <html>
              <head></head>
              <body></body>
            </html>
          `;
          res.write(minifyHtml(inputHtml));
        });
      });
    });

    context('res.write() input data in not a string', () => {
      it('should not alter the input', done => {
        const router = {};
          const route = new Route(router);
          const req = {url: '/aaa/aa.html'};
          const writeData = {something: 'else'};

          const res = {
            write: data => {
              expect(data).to.be.deep.equal(writeData);
              done();
            }
          };

          route._injectHtml(req, res);
          res.write(writeData);
      });
    });
  });
});