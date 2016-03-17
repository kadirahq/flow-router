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
    });
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

  context('addData', () => {
    context('for each data chunk', () => {
      it('should insert to the collection if there no existing item', () => {
        const ssrContext = new SsrContext();
        const collName = Random.id();
        const collection = ssrContext.getCollection(collName);
        expect(collection.find().count()).to.be.equal(0);

        const data = {};
        data[collName] = [
          [{_id: '1', aa: 10}, {_id: '2', aa: 20}]
        ];
        ssrContext.addData(data);
        expect(collection.find().fetch()).to.be.deep.equal(data[collName][0]);
      });

      it('should deepMerge and update if there is an item', () => {
        const ssrContext = new SsrContext();
        const collName = Random.id();
        const collection = ssrContext.getCollection(collName);
        collection.insert({_id: '1', aa: 10, bb: {cc: 10}});
        expect(collection.find().count()).to.be.equal(1);

        const data = {};
        data[collName] = [
          [{_id: '1', aa: 20, bb: {dd: 30}}]
        ];
        ssrContext.addData(data);
        const expectedDoc = {
          _id: '1',
          aa: 20,
          bb: {cc: 10, dd: 30}
        };
        expect(collection.find().fetch()).to.be.deep.equal([expectedDoc]);
      });
    });
  });

  context('addSubscription', () => {
    context('without a FastRender context', () => {
      it('should throw an error', () => {
        const ssrContext = new SsrContext();
        expect(() => ssrContext.addSubscription('abc')).to.throw(/Cannot add a subscription/);
      });
    });

    context('with a FastRender context', () => {
      it('should fetch data from the fastRender context and add it', (done) => {
        const ssrContext = new SsrContext();
        const data = [[{_id: 'aa'}]];
        const frContext = {
          subscribe: (name, p1, p2) => {
            expect(name).to.be.equal('mysub');
            expect([p1, p2]).to.be.deep.equal(['one', 'two']);
            return data;
          }
        };

        ssrContext.addData = _data => {
          expect(_data).to.be.deep.equal(data);
          done();
        };

        FastRender.frContext.withValue(frContext, () => {
          ssrContext.addSubscription('mysub', ['one', 'two']);
        });
      });
    });
  });
});
