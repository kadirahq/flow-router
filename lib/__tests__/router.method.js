const catchable = (done, fn) => {
  try {
    fn();
  } catch (e) {
    done(e);
  }
};

describe('Router', () => {
  const router = new Router();

  context('Common', () => {
    context('Methods', () => {
      context('Route', () => {
        it('should define and go to route', done => {
          const path = `/${Random.id()}`;
          let rendered = 0;

          router.route(path, {
            action() {
              rendered++;
            }
          });

          router.go(path);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) expect(rendered).to.be.equal(1);
              done();
            });
          }, 50);
        });

        it('should define and go to route with fields', done => {
          const rand = Random.id(),
            pathDef = `/${rand}/:key`,
            key = 'abc +@%';
          let rendered = 0, newKey = null;

          router.route(pathDef, {
            action(params) {
              newKey = params.key;
              rendered++;
            }
          });

          router.go(pathDef, {key: key});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                expect(newKey).to.be.equal(key);
                expect(rendered).to.be.equal(1);
              }
              done();
            });
          }, 50);
        });

        it('should parse params and query', done => {
          const rand = Random.id();
          let params = null;

          router.route(`/${rand}/:foo`, {
            action(_params) {
              params = _params;
            }
          });

          router.go(`/${rand}/bar`);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) expect(params).to.have.property('foo', 'bar');
              done();
            });
          }, 200);
        });

        it('should redirect using go method', done => {
          const rand = Random.id(),
            rand2 = Random.id(),
            log = [],
            paths = [`/${rand2}`, `/${rand}`];

          router.route(paths[0], {
            action() {
              log.push(1);
              expect(log).to.have.length(1);
              router.go(paths[1]);
            }
          });

          router.route(paths[1], {
            action() {
              log.push(2);
            }
          });

          router.go(paths[0]);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                expect(log).to.have.length(2);
                expect(log).to.be.equal([1, 2]);
              }
              done();
            });
          }, 50);
        });

        it('should get current route path', done => {
          const value = Random.id(),
            rand = Random.id(),
            pathDef = `/${rand}/:_id`,
            path = `/${rand}/${value}`;
          let detectedValue = null;

          router.route(pathDef, {
            action(params) {
              detectedValue = params._id;
            }
          });

          router.go(path);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                expect(detectedValue).to.be.equal(value);
                expect(router.current().path).to.be.equal(path);
              }
              done();
            });
          }, 50);
        });
      });

      context('setParams', () => {
        it('should work generally', done => {
          const randomKey = Random.id(),
            pathDef = `/${randomKey}/:cat/:id`,
            paramsList = [];

          router.route(pathDef, {
            action(params) {
              paramsList.push(params);
            }
          });

          router.go(pathDef, {cat: 'meteor', id: '200'});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                const success = router.setParams({id: '700'});
                expect(success).to.be.equal(true);
                Meteor.setTimeout(() => {
                  catchable(done, validate);
                }, 50);
              }
              else done();
            });
          }, 50);

          function validate() {
            expect(paramsList).to.have.a.lengthOf(2);
            expect(paramsList[0]).to.have.a.property('cat', 'meteor');
            expect(paramsList[0]).to.have.a.property('id', '200');
            expect(paramsList[1]).to.have.a.property('cat', 'meteor');
            expect(paramsList[1]).to.have.a.property('id', '700');
            done();
          }
        });

        it('should work to preserve query strings', done => {
          const randomKey = Random.id(),
            pathDef = `/${randomKey}/:cat/:id`,
            paramsList = [],
            queryParamsList = [];

          router.route(pathDef, {
            action(params, queryParams) {
              paramsList.push(params);
              queryParamsList.push(queryParams);
            }
          });

          router.go(pathDef, {cat: 'meteor', id: '200 +% / ad'}, {aa: '20 +%'});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                const success = router.setParams({id: '700 +% / ad'});
                expect(success).to.be.equal(true);
                Meteor.setTimeout(() => {
                  catchable(done, validate);
                }, 50);
              }
              else done();
            });
          }, 50);

          function validate() {
            expect(paramsList).to.have.a.lengthOf(2);
            expect(paramsList[0]).to.have.a.property('cat', 'meteor');
            expect(paramsList[0]).to.have.a.property('id', '200 +% / ad');
            expect(paramsList[1]).to.have.a.property('cat', 'meteor');
            expect(paramsList[1]).to.have.a.property('id', '700 +% / ad');
            expect(queryParamsList).to.be.equal([{aa: '20 +%'}, {aa: '20 +%'}]);
            done();
          }
        });

        it('should not work when no route is selected', () => {
          if (Meteor.isClient) {
            const originalRoute = router._current.route;
            router._current.route = undefined;
            const success = router.setParams({id: '800'});
            expect(success).to.be.equal(false);
            router._current.route = originalRoute;
          }
        });
      });

      context('setQueryParams', () => {
        it('should work using check', done => {
          const rand = Random.id();
          const pathDef = `/${rand}`;
          let rendered = 0;
          router.route(pathDef, {
            action() {
              rendered++;
            }
          });

          router.go(pathDef, {}, {cat: 'meteor', id: '200'});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) check(router.current().queryParams, {cat: String, id: String});
              done();
            });
          }, 50);
        });

        it('should work generally', done => {
          const randomKey = Random.id(),
            pathDef = `/${randomKey}`,
            queryParamsList = [];

          router.route(pathDef, {
            action(params, queryParams) {
              queryParamsList.push(queryParams);
            }
          });

          router.go(pathDef, {}, {cat: 'meteor', id: '200'});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                const success = router.setQueryParams({id: '700'});
                expect(success).to.be.equal(true);
                Meteor.setTimeout(() => {
                  catchable(done, validate);
                }, 50);
              }
              else done();
            });
          }, 50);

          function validate() {
            expect(queryParamsList).to.have.a.lengthOf(2);
            expect(queryParamsList[0]).to.have.a.property('cat', 'meteor');
            expect(queryParamsList[0]).to.have.a.property('id', '200');
            expect(queryParamsList[1]).to.have.a.property('cat', 'meteor');
            expect(queryParamsList[1]).to.have.a.property('id', '700');
            done();
          }
        });

        it('should remove query param that is null', done => {
          const randomKey = Random.id(),
            pathDef = `/${randomKey}`,
            queryParamsList = [];

          router.route(pathDef, {
            action(params, queryParams) {
              queryParamsList.push(queryParams);
            }
          });

          router.go(pathDef, {}, {cat: 'meteor', id: '200'});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                const success = router.setQueryParams({id: '700', cat: null});
                expect(success).to.be.equal(true);
                Meteor.setTimeout(() => {
                  catchable(done, validate);
                }, 50);
              }
              else done();
            });
          }, 50);

          function validate() {
            expect(queryParamsList).to.have.a.lengthOf(2);
            expect(queryParamsList[0]).to.have.a.property('cat', 'meteor');
            expect(queryParamsList[0]).to.have.a.property('id', '200');
            expect(queryParamsList[1]).to.not.have.a.property('cat');
            expect(queryParamsList[1]).to.have.a.property('id', '700');
            done();
          }
        });

        it('should remove query param that is undefined', done => {
          const randomKey = Random.id(),
            pathDef = `/${randomKey}`,
            queryParamsList = [];

          router.route(pathDef, {
            action(params, queryParams) {
              queryParamsList.push(queryParams);
            }
          });

          router.go(pathDef, {}, {cat: 'meteor', id: '200'});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                const success = router.setQueryParams({id: '700', cat: undefined});
                expect(success).to.be.equal(true);
                Meteor.setTimeout(() => {
                  catchable(done, validate);
                }, 50);
              }
              else done();
            });
          }, 50);

          function validate() {
            expect(queryParamsList).to.have.a.lengthOf(2);
            expect(queryParamsList[0]).to.have.a.property('cat', 'meteor');
            expect(queryParamsList[0]).to.have.a.property('id', '200');
            expect(queryParamsList[1]).to.not.have.a.property('cat');
            expect(queryParamsList[1]).to.have.a.property('id', '700');
            done();
          }
        });

        it('should work to preserve params', done => {
          const randomKey = Random.id(),
            pathDef = `/${randomKey}/:abc`,
            paramsList = [],
            queryParamsList = [];

          router.route(pathDef, {
            action(params, queryParams) {
              paramsList.push(params);
              queryParamsList.push(queryParams);
            }
          });

          router.go(pathDef, {abc: '20'}, {cat: 'meteor', id: '200'});

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                const success = router.setQueryParams({id: '700'});
                expect(success).to.be.equal(true);
                Meteor.setTimeout(() => {
                  catchable(done, validate);
                }, 50);
              }
              else done();
            });
          }, 50);

          function validate() {
            expect(queryParamsList).to.have.a.lengthOf(2);
            expect(queryParamsList).to.be.equal([
              {cat: 'meteor', id: '200'}, {cat: 'meteor', id: '700'}
            ]);
            expect(paramsList).to.have.a.lengthOf(2);
            expect(paramsList[0]).to.have.a.property('abc', '20');
            expect(paramsList[1]).to.have.a.property('abc', '20');
            done();
          }
        });

        it('should not work when no route is selected', () => {
          if (Meteor.isClient) {
            const originalRoute = router._current.route;
            router._current.route = undefined;
            const success = router.setQueryParams({id: '800'});
            expect(success).to.be.equal(false);
            router._current.route = originalRoute;
          }
        });
      });

      context('notFound', () => {
        it('should work', done => {
          const path = `/${Random.id()}`;
          let rendered = 0;

          router.notFound = {
            action() {
              rendered++;
            }
          };

          router.go(path);

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) expect(rendered).to.be.equal(1);
              done();
            });
          }, 50);
        });
      });

      context('withReplaceState', () => {
        it('should work when enabled', done => {
          const pathDef = `/${Random.id()}/:id`;
          const router1 = new Router();
          let callCount = 0;

          if (Meteor.isClient) {
            const originalRedirect = router1._page.replace;

            router1._page.replace = path => {
              callCount++;
              originalRedirect.call(router1._page, path);
            };

            router1.route(pathDef, {
              name: name,
              action(params) {
                expect(params.id).to.be.equal('awesome');
                expect(callCount).to.be.equal(1);
                router1._page.replace = originalRedirect;
                // We don't use Meteor.defer here since it carries
                // Meteor.Environment vars too
                // Which breaks our test below
                Meteor.setTimeout(done, 0);
              }
            });

            router1.withReplaceState(() => {
              router1.go(pathDef, {id: 'awesome'});
            });
          }
          else done();
        });

        it('should work when disabled', done => {
          const pathDef = `/${Random.id()}/:id`;
          const router2 = new Router();
          let callCount = 0;

          if (Meteor.isClient) {
            const originalRedirect = router2._page.replace;

            router2._page.replace = (path) => {
              callCount++;
              originalRedirect.call(router._page, path);
            };

            router2.route(pathDef, {
              name: name,
              action(params) {
                expect(params.id).to.be.equal('awesome');
                expect(callCount).to.be.equal(0);
                router2._page.replace = originalRedirect;
                Meteor.defer(done);
              }
            });

            router2.go(pathDef, {id: 'awesome'});
          }
          else done();
        });
      });

      context('withTrailingSlash', () => {
        it('should work when enabled', done => {
          const rand = Random.id();
          let rendered = 0;

          router.route(`/${rand}`, {
            action() {
              rendered++;
            }
          });

          router.withTrailingSlash(() => {
            router.go(`/${rand}`);
          });

          Meteor.setTimeout(() => {
            catchable(done, () => {
              if (Meteor.isClient) {
                expect(rendered).to.be.equal(1);
                expect(_.last(location.href), '/');
              }
              Meteor.setTimeout(done, 100);
            });
          }, 100);
        });
      });

      context('Idempotent Routing', () => {
        it('should call action', done => {
          const rand = Random.id();       // var rand = Random.id();
          const pathDef = `/${rand}`;     // var pathDef = '/' + rand;
          let rendered = 0;               // var rendered = 0;

          router.route(pathDef, {         // FlowRouter.route(pathDef, {
            action() {                    //   action: function(params) {
              rendered++;                 //     rendered++;
            }                             //   }
          });                             // });

          router.go(pathDef);             // FlowRouter.go(pathDef);

          Meteor.defer(() => {            // Meteor.defer(function() {
            catchable(done, () => {
              router.go(pathDef);         //   FlowRouter.go(pathDef);

              Meteor.defer(() => {        //   Meteor.defer(function() {
                catchable(done, () => {
                  if (Meteor.isClient) expect(rendered).to.be.equal(1);
                                          //     test.equal(rendered, 1);
                  done();                 //     done();
                });                       //   });
              });                         // });
            });
          });
        });

        it('should call triggers', done => {
          const rand = Random.id();
          const pathDef = `/${rand}`;
          let runnedTriggers = 0;
          let finish = false;

          const triggerFns = [() => {
            if (finish) return;
            runnedTriggers++;
          }];

          router.triggers.enter(triggerFns);

          router.route(pathDef, {
            triggersEnter: triggerFns,
            triggersExit: triggerFns
          });

          router.go(pathDef);

          router.triggers.exit(triggerFns);

          Meteor.defer(() => {
            catchable(done, () => {
              router.go(pathDef);

              Meteor.defer(() => {
                catchable(done, () => {
                  if (Meteor.isClient) expect(runnedTriggers).to.be.equal(2);
                  finish = true;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});
