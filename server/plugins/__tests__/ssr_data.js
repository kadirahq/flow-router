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
          addSubscription: () => {
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
        const handle = Meteor.subscribe('aa', 'bb');
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
        it('should call the original collection', done => {
          const collName = Random.id();
          const ssrContext = new SsrContext();

          FlowRouter.ssrContext.withValue(ssrContext, () => {
            const coll = new Mongo.Collection(collName);
            const doc = {_id: '100', aa: 10};
            coll.insert(doc);
            coll.insert({_id: '200', aa: 20});
            coll.insert({_id: '300', aa: 10});

            FlowRouter.inSubscription.withValue(true, () => {
              const options = {sort: {_id: 1}, limit: 1};
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

        const options = {sort: {_id: 1}, limit: 1};
        const data = coll.find({aa: 10}, options).fetch();
        expect(data).to.be.equal([doc]);
      });
    });
  });

  context('Mongo.findOne()', () => {
    it('should call the new wrapped Mongo.find()', done => {
      const collName = Random.id();
      const selector = {aa: 10};
      const options = {bb: 20};
      const data = [{_id: 'one', aa: 10}, {_id: 'two', aa: 20}];

      const cursor = {
        fetch: () => data
      };

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
        const doc = coll.findOne(selector, options);
        expect(doc).to.be.equal(data[0]);
        done();
      });
    });
  });

  context('Meteor.call', () => {
    context('with a SSR Context', () => {
      it('should call the method with the SSR Context', () => {
        const methodName = Random.id();
        const ssrContext = new SsrContext();

        Meteor.methods({
          [methodName]: (a, b) => {
            expect(FlowRouter.ssrContext.get()).to.be.null;
            return a + b;
          }
        });

        FlowRouter.ssrContext.withValue(ssrContext, () => {
          const result = Meteor.call(methodName, 10, 20);
          expect(result).to.be.equal(30);
        });
      });

      it('should bind the original function with Meteor.bindEnvironemnt', done => {
        const methodName = Random.id();
        const ssrContext = new SsrContext();
        const sampleEnv = new Meteor.EnvironmentVariable();

        Meteor.methods({
          [methodName]: () => {
            expect(sampleEnv.get()).to.be.true;
            done();
          }
        });

        sampleEnv.withValue(true, () => {
          FlowRouter.ssrContext.withValue(ssrContext, () => {
            Meteor.call(methodName);
          });
        });
      });
    });
  });

  context('Meteor.loggingIn', () => {
    context('always', () => {
      it('should return false', () => {
        expect(Meteor.loggingIn()).to.be.false;
      });
    });
  });

  context('Tracker.autorun', () => {
    context('with a SSR Context', () => {
      it('should call the function immediately & stop invalidating', done => {
        const ssrContext = new SsrContext();
        const someVar = new ReactiveVar();
        let runCount = 0;

        FlowRouter.ssrContext.withValue(ssrContext, () => {
          Tracker.autorun(() => {
            someVar.get();
            runCount++;
          });

          // this is to check the autorun function runs immediately.
          expect(runCount).to.be.equal(1);

          // this is to check autorun won't run again for invalidations
          someVar.set(200);
          Meteor.setTimeout(() => {
            expect(runCount).to.be.equal(1);
            done();
          }, 200);
        });
      });

      it('should has the firstRun=true option', done => {
        FlowRouter.ssrContext.withValue(new SsrContext(), () => {
          Tracker.autorun(c => {
            expect(c.firstRun).to.be.true;
            done();
          });
        });
      });

      it('should has a stop option which does nothing', done => {
        FlowRouter.ssrContext.withValue(new SsrContext(), () => {
          Tracker.autorun(c => {
            // this is just a test to make sure we've a stop function
            c.stop();
            done();
          });
        });
      });
    });

    context('without a SSR Context', () => {
      it('should call the original Tracker.autorun', done => {
        const someVar = new ReactiveVar();
        let runCount = 0;

        const c = Tracker.autorun(() => {
          someVar.get();
          runCount++;
        });

        someVar.set(200);
        Meteor.setTimeout(() => {
          expect(runCount).to.be.equal(2);
          c.stop();
          done();
        }, 200);
      });
    });
  });
});
