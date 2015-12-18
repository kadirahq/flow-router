const catchable = (done, fn) => {
  try {
    fn();
  } catch (e) {
    done(e);
  }
};

describe('Group', () => {
  const router = new Router();
  context('Common', () => {
    context('Methods', () => {
      it('should set and retrieve group name', done => {
        const rand = Random.id(),
          name = Random.id(),
          group = new Group(router, {name}),
          timer = setTimeout(Meteor.bindEnvironment(() => {done();}), 50);

        group.route(`/${rand}`, {
          action() {
            expect(router.current().route.group.name).to.be.equal(name);
            clearTimeout(timer);
            done();
          }
        });

        router.go(`/${rand}`);
      });

      context('Route', () => {
        const prefix = Random.id(),
          rand = Random.id();

        it('should work with prefix', done => {
          const group = new Group(router, {prefix: `/${prefix}`});
          let rendered = 0;

          group.route(`/${rand}`, {
            action: function() {
              rendered++;
            }
          });

          router.go(`/${prefix}/${rand}`);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) expect(rendered).to.be.equal(1);
              done();
            });
          }, 50);
        });

        it('should work without prefix', done => {
          const group = new Group(router);
          let rendered = 0;

          group.route(`/${rand}`, {
            action() {
              rendered++;
            }
          });

          router.go(`/${rand}`);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) expect(rendered).to.be.equal(1);
              done();
            });
          }, 50);
        });
      });
    });
  });
});
