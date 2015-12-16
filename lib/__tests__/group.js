describe('Group', () => {
  const router = new Router();
  context('class', () => {
    it('should be an extension of the SharedGroup', () => {
      const newGroup = new Group(router);
      expect(newGroup).to.be.an.instanceof(Group);
      expect(newGroup).to.be.an.instanceof(SharedGroup);
    });
  });

  context('functionalities', () => {
    it('should set and retrieve group name', () => {
      const rand = Random.id();
      const name = Random.id();
      const newGroup = new Group(router, {name});

      if (Meteor.isClient) {
        newGroup.route(`/${rand}`);
        router.go(`/${rand}`);
        expect(router.current().route.group.name).to.be.equal(name);
      }
    });

    context('define and go to route', () => {
      const prefix = Random.id();
      const rand = Random.id();

      it('should work with prefix', () => {
        const newGroup = new Group(router, {prefix: `/${prefix}`});
        let rendered = 0;

        newGroup.route(`/${rand}`, {
          action() {
            rendered++;
          }
        });

        if (Meteor.isClient) {
          router.go(`/${prefix}/${rand}`);
          expect(rendered).to.be.equal(1);
        }
      });

      it('should work without prefix', () => {
        const newGroup = new Group(router);
        let rendered = 0;

        newGroup.route(`/${rand}`, {
          action() {
            rendered++;
          }
        });

        if (Meteor.isClient) {
          router.go(`/${rand}`);
          expect(rendered).to.be.equal(1);
        }
      });
    });
  });
});
