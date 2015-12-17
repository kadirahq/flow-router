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
            action: function() {
              log.push(1);
              expect(log).to.have.length(1);
              router.go(paths[1]);
            }
          });

          router.route(paths[1], {
            action: function() {
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
      });
    });
  });
});
