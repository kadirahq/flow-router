describe('Group', () => {
  const router = new Router();
  context('Common', () => {
    context('Methods', () => {
      it('should set and retrieve group name', done => {
        const rand = Random.id(),
          name = Random.id(),
          group = new Group(router, {name}),
          timer = setTimeout(Meteor.bindEnvironment(() => {done();}), 100);

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
          const group = new Group(router, {prefix: `/${prefix}`}),
            rendered = new ReactiveVar(),
            timer = setTimeout(Meteor.bindEnvironment(() => {done();}), 100);

          group.route(`/${rand}`, {
            action: function() {
              rendered.set(true);
            }
          });

          router.go(`/${prefix}/${rand}`);

          Tracker.autorun(() => {
            if (Meteor.isClient) {
              expect(rendered.get()).to.be.equal(true);
              clearTimeout(timer);
              done();
            }
          });
        });

        it('should work without prefix', done => {
          const group = new Group(router),
            rendered = new ReactiveVar(),
            timer = setTimeout(Meteor.bindEnvironment(() => {done();}), 100);

          group.route(`/${rand}`, {
            action() {
              rendered.set(true);
            }
          });

          router.go(`/${rand}`);

          Tracker.autorun(() => {
            if (Meteor.isClient) {
              expect(rendered.get()).to.be.equal(true);
              clearTimeout(timer);
              done();
            }
          });
        });
      });
    });
  });
});
