describe('Group', () => {
  const router = new Router();

  context('Common', () => {
    context('Class', () => {
      it('should be an extension of the SharedGroup', () => {
        const newGroup = new Group(router);
        expect(newGroup).to.be.an.instanceof(Group);
        expect(newGroup).to.be.an.instanceof(SharedGroup);
      });
    });
  });
});
