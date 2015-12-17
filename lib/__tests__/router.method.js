describe('Router', () => {
  const router = new Router();

  context('Common', () => {
    context('Methods', () => {
      context('Route', () => {
        it('should define and go to route', done => {
          const path = `/${Random.id()}`,
            rendered = new ReactiveVar(),
            timer = setTimeout(Meteor.bindEnvironment(() => {done();}), 100);

          router.route(path, {
            action() {
              rendered.set(true);
            }
          });

          router.go(path);

          Tracker.autorun(() => {
            if (Meteor.isClient) {
              expect(rendered.get()).to.be.equal(true);
              clearTimeout(timer);
              done();
            }
          });
        });

        it('should define and go to route with fields', done => {
          const rand = Random.id(),
            pathDef = `/${rand}/:key`,
            key = 'abc +@%',
            rendered = new ReactiveVar(),
            timer = setTimeout(Meteor.bindEnvironment(() => {done();}), 100);

          router.route(pathDef, {
            action(params) {
              expect(params).to.have.property('key', key);
              rendered.set(true);
            }
          });

          router.go(pathDef, {key: key});

          Tracker.autorun(() => {
            if (Meteor.isClient) {
              expect(rendered.get()).to.be.equal(true);
              clearTimeout(timer);
              done();
            }
          });
        });

        it('should parse params and query', done => {
          const rand = Random.id(),
            timer = setTimeout(Meteor.bindEnvironment(() => {done();}), 100);

          router.route(`/${rand}/:foo'`, {
            action: function(params) {
              expect(params).to.have.property('foo', 'bar');
              clearTimeout(timer);
              done();
            }
          });

          router.go(`/${rand}/bar`);
        });

        it('should redirect using go method', done => {
          const rand = Random.id(),
            rand2 = Random.id(),
            log = [],
            paths = [`/${rand2}`, `/${rand}`],
            timer = setTimeout(Meteor.bindEnvironment(() => {done();}), 100),
            action = () => {
              expect(log).to.have.length(2);
              expect(log).to.be.equal([1, 2]);
              clearTimeout(timer);
              done();
            };

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
              action();
            }
          });

          router.notFound = {action: action};

          router.go(paths[0]);
        });
      });
    });
  });
});
