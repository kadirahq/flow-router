const minifyHtml = str => {
  return str.split('\n').map(line => line.trim()).join('');
};

describe('Route', () => {
  context('page Caching', () => {
    context('new page', () => {
      it('should be able to cache the page and get it back', () => {
        const route = new Route();
        const pageInfo = {aa: 10};
        const userId = 'aaaa';

        route._cachePage('/the-url', userId, pageInfo, 100);
        expect(route._getCachedPage('/the-url', userId)).to.be.deep.equal(pageInfo);
      });

      it('should expire the page after a timeout', () => {
        const route = new Route();
        const pageInfo = {aa: 10};
        const userId = 'aaaa';

        route._cachePage('/the-url', userId, pageInfo, 100);
        Meteor._sleepForMs(200);
        expect(route._getCachedPage('/the-url', userId)).to.be.null;
      });
    });

    context('exiting page', () => {
      it('should throw an error when trying to cache again', () => {
        const route = new Route();
        const pageInfo = {aa: 10};
        const userId = 'aaaa';

        route._cachePage('/the-url', userId, pageInfo, 100);
        // doing it for the second time.
        route._cachePage('/the-url', userId, {aa: 2323}, 100);

        const cachedPage = route._getCachedPage('/the-url', userId);
        expect(cachedPage).to.be.deep.equal(pageInfo);
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
        it('should be false', () => {
          const route = new Route();
          const isHtml = route._isHtmlPage('/anc/sds/aa.xyz');
          expect(isHtml).to.be.false;
        });
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
      expect(context._serverRequest).to.be.equal(req);

      delete context.route;
      delete context._serverRequest;
      expect(context).to.be.deep.equal({
        path: req.url,
        params: {aa: 10},
        queryParams: {bb: 20}
      });

      // check that the original params object wasn't modified
      expect(params).to.be.deep.equal({
        aa: 10, query: {bb: 20}
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
            }
          };
          InjectData.pushData(res, 'fast-render-data', frData);

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

  context('_processFromSsr', () => {
    context('always', () => {
      it('should call the action properly', done => {
        const params = {aa: 10};
        const context = {
          params: {aa: 10}, queryParams: {bb: 10}
        };
        const req = {url: 'the-url'};
        const res = {};

        const router = new Router();
        const action = (p, q) => {
          const c = router.routeContext.get();
          expect(p).to.be.deep.equal(c.params);
          expect(q).to.be.deep.equal(c.queryParams);

          expect(router.ssrContext).to.be.ok;
          done();
        };

        const route = new Route(router, '/', {action});
        route._buildContext = (r, p) => {
          expect(r.url).to.be.equal(req.url);
          expect(p).to.be.deep.equal(params);
          return context;
        };

        route._processFromSsr(params, req, res);
      });

      it('should call the ._injectHtml()', done => {
        const req = {url: 'the-url'};
        const res = {};

        const router = new Router();
        const route = new Route(router, '/', {});

        route._buildContext = () => null;
        route._injectHtml = (_req, _res, _ssrContext) => {
          expect(_req).to.be.equal(req);
          expect(_res).to.be.equal(res);
          expect(_ssrContext).to.be.instanceOf(SsrContext);
          done();
        };
        route._processFromSsr(null, req, res);
      });
    });

    context('with frData', () => {
      it('should add it to the ssr context', done => {
        const req = {url: 'the-url'};
        const doc = {_id: 'aa', aa: 10};
        const frData = {
          collectionData: {
            posts: [[doc]]
          }
        };
        const res = {};
        InjectData.pushData(res, 'fast-render-data', frData);

        const router = new Router();
        const route = new Route(router, '/', {});

        route._buildContext = () => null;
        route._injectHtml = (_req, _res, ssrContext) => {
          const docs = ssrContext.getCollection('posts').find().fetch();
          expect(docs).to.be.deep.equal([doc]);
          done();
        };
        route._processFromSsr(null, req, res);
      });
    });
  });

  context('_processFromCache', () => {
    it('should inject the cached html', done => {
      const route = new Route();
      const pageInfo = {html: 'the-html'};

      const res = {
        write: data => {
          expect(data).to.be.equal(pageInfo.html);
          done();
        }
      };

      route._processFromCache(pageInfo, res, () => {
        res.write('');
      });
    });

    it('should inject the frData', () => {
      const route = new Route();
      const pageInfo = {frData: {aa: 10}};

      const res = {};

      route._processFromCache(pageInfo, res, () => {});
      const frData = InjectData.getData(res, 'fast-render-data');
      expect(frData).to.be.deep.equal(pageInfo.frData);
    });
  });

  context('_handleRoute', () => {
    context('not a html page', () => {
      it('should simply call next', done => {
        const route = new Route();
        const req = {url: '/aa.jpg'};
        DDP._CurrentInvocation.withValue({userId: 'someId'}, () => {
          route._handleRoute(null, req, null, done);
        });
      });
    });

    context('if the page is cahced', () => {
      it('should process the cached page', done => {
        const route = new Route();
        const req = {url: '/aa.html'};
        const res = {write: () => {}};
        const next = () => {throw new Error('should not call next');};
        const pageInfo = {aa: 10};

        route._processFromCache = (c, r, n) => {
          expect(c).to.be.deep.equal(pageInfo);
          expect(r).to.be.equal(res);
          expect(n).to.be.equal(next);
          done();
        };

        // let's cache the page
        const userId = 'aaa';
        route._cachePage(req.url, userId, pageInfo, 100);
        DDP._CurrentInvocation.withValue({userId}, () => {
          route._handleRoute(null, req, res, next);
        });
      });
    });

    context('otherwise', () => {
      it('should handle SSR with FastRender', done => {
        const route = new Route();
        const req = {url: '/aa.html'};
        const res = {write: () => {}};
        const next = () => {throw new Error('should not call next');};
        const params = {};

        const originalHandleRoute = FastRender.handleRoute;

        route._processFromSsr = (_params, _req, _res) => {
          expect(_params).to.be.equal(params);
          expect(_req).to.be.equal(req);
          expect(_res).to.be.equal(res);

          done();
        };

        FastRender.handleRoute = (processFromSsr, _params, _req, _res, _next) => {
          expect(_params).to.be.equal(params);
          expect(_req).to.be.equal(req);
          expect(_res).to.be.equal(res);
          expect(_next).to.be.equal(next);

          // restore FastRender's original handleRoute
          FastRender.handleRoute = originalHandleRoute;
          processFromSsr();
        };

        DDP._CurrentInvocation.withValue({userId: 'someId'}, () => {
          route._handleRoute(params, req, res, next);
        });
      });
    });
  });
});
