const catchable = (done, fn) => {
  try {
    fn();
  } catch (e) {
    done(e);
  }
};

describe('Router', () => {
  const router = new Router();

  context('Common', () => {
    context('Methods', () => {
      context('Route', () => {
        it('should define and go to route', done => {
          const path = `/${Random.id()}`;
          let rendered = 0;

          router.route(path, {
            action() {
              rendered++;
            }
          });

          router.go(path);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) expect(rendered).to.be.equal(1);
              done();
            });
          }, 50);
        });

        it('should define and go to route with fields', done => {
          const rand = Random.id(),
            pathDef = `/${rand}/:key`,
            key = 'abc +@%';
          let rendered = 0, newKey = null;

          router.route(pathDef, {
            action(params) {
              newKey = params.key;
              rendered++;
            }
          });

          router.go(pathDef, {key: key});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                expect(newKey).to.be.equal(key);
                expect(rendered).to.be.equal(1);
              }
              done();
            });
          }, 50);
        });

        it('should parse params and query', done => {
          const rand = Random.id();
          let params = null;

          router.route(`/${rand}/:foo`, {
            action(_params) {
              params = _params;
            }
          });

          router.go(`/${rand}/bar`);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) expect(params).to.have.property('foo', 'bar');
              done();
            });
          }, 200);
        });

        it('should redirect using go method', done => {
          const rand = Random.id(),
            rand2 = Random.id(),
            log = [],
            paths = [`/${rand2}`, `/${rand}`];

          router.route(paths[0], {
            action() {
              log.push(1);
              expect(log).to.have.length(1);
              router.go(paths[1]);
            }
          });

          router.route(paths[1], {
            action() {
              log.push(2);
            }
          });

          router.go(paths[0]);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                expect(log).to.have.length(2);
                expect(log).to.be.equal([1, 2]);
              }
              done();
            });
          }, 50);
        });

        it('should get current route path', done => {
          const value = Random.id(),
            rand = Random.id(),
            pathDef = `/${rand}/:_id`,
            path = `/${rand}/${value}`;
          let detectedValue = null;

          router.route(pathDef, {
            action(params) {
              detectedValue = params._id;
            }
          });

          router.go(path);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                expect(detectedValue).to.be.equal(value);
                expect(router.current().path).to.be.equal(path);
              }
              done();
            });
          }, 50);
        });
      });

      context('setParams', () => {
        it('should work generally', done => {
          const randomKey = Random.id(),
            pathDef = `/${randomKey}/:cat/:id`,
            paramsList = [];

          router.route(pathDef, {
            action(params) {
              paramsList.push(params);
            }
          });

          router.go(pathDef, {cat: 'meteor', id: '200'});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                const success = router.setParams({id: '700'});
                expect(success).to.be.equal(true);
                Meteor.setTimeout(() => {
                  catchable(done, validate);
                }, 50);
              }
              else done();
            });
          }, 50);

          function validate() {
            expect(paramsList).to.have.a.lengthOf(2);
            expect(paramsList[0]).to.have.a.property('cat', 'meteor');
            expect(paramsList[0]).to.have.a.property('id', '200');
            expect(paramsList[1]).to.have.a.property('cat', 'meteor');
            expect(paramsList[1]).to.have.a.property('id', '700');
            done();
          }
        });

        it('should work preserve query strings', done => {
          const randomKey = Random.id(),
            pathDef = `/${randomKey}/:cat/:id`,
            paramsList = [],
            queryParamsList = [];

          router.route(pathDef, {
            action(params, queryParams) {
              paramsList.push(params);
              queryParamsList.push(queryParams);
            }
          });

          router.go(pathDef, {cat: 'meteor', id: '200 +% / ad'}, {aa: '20 +%'});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                const success = router.setParams({id: '700 +% / ad'});
                expect(success).to.be.equal(true);
                Meteor.setTimeout(() => {
                  catchable(done, validate);
                }, 50);
              }
              else done();
            });
          }, 50);

          function validate() {
            expect(paramsList).to.have.a.lengthOf(2);
            expect(paramsList[0]).to.have.a.property('cat', 'meteor');
            expect(paramsList[0]).to.have.a.property('id', '200 +% / ad');
            expect(paramsList[1]).to.have.a.property('cat', 'meteor');
            expect(paramsList[1]).to.have.a.property('id', '700 +% / ad');
            expect(queryParamsList).to.be.equal([{aa: '20 +%'}, {aa: '20 +%'}]);
            done();
          }
        });
      });
    });
  });
});
