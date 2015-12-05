describe('SSR Data', () => {
  context('Meteor.subscribe()', () => {
    context('with a SSR Context', () => {
      it('should add the subscription to SSR Context', done => {
        const ssrContext = {
          addSubscription: (name, params) => {
            expect(name).to.be.equal('subName');
            expect(params).to.be.deep.equal(['one', 'two']);
            done();
          }
        };

        FlowRouter.ssrContext.withValue(ssrContext, () => {
          Meteor.subscribe('subName', 'one', 'two');
        });
      });

      it('should have the FlowRouter.inSubscription env', done => {
        const ssrContext = {
          addSubscription: (name, params) => {
            expect(FlowRouter.inSubscription.get()).to.be.true;
            done();
          }
        };

        FlowRouter.ssrContext.withValue(ssrContext, () => {
          Meteor.subscribe('subName', 'one', 'two');
        });
      });
    });

    context('always', () => {
      it('should return ready => true', () => {
        const handle = Meteor.subscribe('aa','bb');
        expect(handle.ready()).to.be.true;
      });
    });
  });

  context('Mongo.find()', () => {
    context('with a SSR Context', () => {
      context('not inside a subscription', () => {
        it('should get the collection from the ssrContext', done => {
          const cursor = {};
          const collName = Random.id();
          const selector = {aa: 10};
          const options = {bb: 20};

          const ssrCollection = {
            find: (s, o) => {
              expect(s).to.be.deep.equal(selector);
              expect(o).to.be.deep.equal(options);
              return cursor;
            }
          };

          const ssrContext = {
            getCollection: name => {
              expect(name).to.be.equal(collName);
              return ssrCollection;
            }
          };

          FlowRouter.ssrContext.withValue(ssrContext, () => {
            const coll = new Mongo.Collection(collName);
            const c = coll.find(selector, options);
            expect(c).to.be.equal(cursor);
            done();
          });
        });
      });

      context('inside a subscription', () => {
        it('should call the original collection', () => {
          const cursor = {};
          const collName = Random.id();

          const ssrContext = {};

          FlowRouter.ssrContext.withValue(ssrContext, () => {
            const coll = new Mongo.Collection(collName);
            const doc = {_id: '100', aa: 10};
            coll.insert(doc);
            coll.insert({_id: '200', aa: 20});
            coll.insert({_id: '300', aa: 10});
            
            FlowRouter.inSubscription.withValue(true, () => {
              const options = {sort: {_id: 1}, limit: 1}
              const data = coll.find({aa: 10}, options).fetch();
              expect(data).to.be.equal([doc]);
              done();
            });
          });
        });
      });
    });

    context('without a SSR Context', () => {
      it('should call the original find', () => {
        const collName = Random.id();
        const coll = new Mongo.Collection(collName);
        const doc = {_id: '100', aa: 10};
        coll.insert(doc);
        coll.insert({_id: '200', aa: 20});
        coll.insert({_id: '300', aa: 10});
        
        const options = {sort: {_id: 1}, limit: 1}
        const data = coll.find({aa: 10}, options).fetch();
        expect(data).to.be.equal([doc]);
      });
    });
  });
});