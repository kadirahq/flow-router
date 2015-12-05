describe('SSR Context', () => {
  context('getCollection', () => {
    it('should create a collection if there is not', () => {
      const ssrContext = new SsrContext();
      const collection = ssrContext.getCollection('collName');
      expect(collection).to.be.ok;
    });

    it('should return the collection already created if exists', () => {
      const ssrContext = new SsrContext();
      const collection1 = ssrContext.getCollection('collName1');
      const collection2 = ssrContext.getCollection('collName1');

      expect(collection1).to.be.deep.equal(collection2);
    })
  });

  context('body', () => {
    it('should add and get body', () => {
      const ssrContext = new SsrContext();

      const html1 = '<p>Sample <em>Html</em> Strings</p>';
      ssrContext.setHtml(html1);
      const html2 = ssrContext.getHtml();

      expect(html1).to.be.equal(html2);
    });

    it('should override existing body', () => {
      const ssrContext = new SsrContext();

      const body = '<p>Sample <em>Html</em> Strings</p>';
      ssrContext.setHtml(body);
      let existingBody = ssrContext.getHtml();
      expect(body).to.be.equal(existingBody);

      const bodyToOverride = '<div>Demo HTML Content</div>';
      ssrContext.setHtml(bodyToOverride);
      existingBody = ssrContext.getHtml();
      expect(bodyToOverride).to.be.equal(existingBody);
    });
  });

  context('head', () => {
    it('should get the existing head', () => {
      const ssrContext = new SsrContext();
      
      const headHtml = '<h1>Head</h1>';
      ssrContext.addToHead(headHtml);
      const existingHead = ssrContext.getHead();
      const expectedHead = `\n${headHtml}`;

      expect(expectedHead).to.be.equal(existingHead);
    });

    it('should append to the existing head', () => {
      const ssrContext = new SsrContext();

      const headHtml = '<h1>Head</h1>';
      ssrContext.addToHead(headHtml);
      let existingHead = ssrContext.getHead();
      let expectedHead = `\n${headHtml}`;
      
      expect(expectedHead).to.be.equal(existingHead);

      const headHtmlToAppend = '<h2>Head 2</h2>';
      ssrContext.addToHead(headHtmlToAppend);
      existingHead = ssrContext.getHead();
      expectedHead += `\n${headHtmlToAppend}`;

      expect(expectedHead).to.be.equal(existingHead);
    });
  });
});