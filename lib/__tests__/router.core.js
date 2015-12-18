describe('Route', () => {
  const router = new Router();

  context('Common', () => {
    context('Class', () => {
      it('should be an extension of the SharedRouter', () => {
        expect(router).to.be.an.instanceof(Router);
        expect(router).to.be.an.instanceof(SharedRouter);
      });
    });
  });
});
