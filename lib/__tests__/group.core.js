describe('Group', () => {
  const router = new Router();

  context('Common', () => {
    context('Class', () => {
      it('should be an extension of the SharedGroup', () => {
        const group = new Group(router);
        expect(group).to.be.an.instanceof(Group);
        expect(group).to.be.an.instanceof(SharedGroup);
      });
    });
  });
});
