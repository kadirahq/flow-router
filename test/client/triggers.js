Tinytest.addAsync(
'Triggers - runTriggers - run all and after',
function(test, done) {
  var store = [];
  var triggers = MakeTriggers(2, store);
  Triggers.runTriggers(triggers, null, null, function() {
    test.equal(store, [0, 1]);
    done();
  });
});

Tinytest.addAsync(
'Triggers - runTriggers - redirect with url',
function(test, done) {
  var store = [];
  var url = "http://google.com";
  var triggers = MakeTriggers(2, store);
  triggers.splice(1, 0, function(context, redirect) {
    redirect(url); 
  });

  Triggers.runTriggers(triggers, null, function(u) {
    test.equal(store, [0]);
    test.equal(u, url);
    done();
  }, null);
});

Tinytest.addAsync(
'Triggers - runTriggers - redirect without url',
function(test, done) {
  var store = [];
  var url = "http://google.com";
  var triggers = MakeTriggers(2, store);
  triggers.splice(1, 0, function(context, redirect) {
    try {
      redirect(); 
    } catch(ex) {
      test.isTrue(/requires an URL/.test(ex.message));
      test.equal(store, [0]);
      done();
    }
  });

  Triggers.runTriggers(triggers, null, null, null);
});

Tinytest.addAsync(
'Triggers - runTriggers - redirect in a different event loop',
function(test, done) {
  var store = [];
  var url = "http://google.com";
  var triggers = MakeTriggers(2, store);
  var doneCalled = false;

  triggers.splice(1, 0, function(context, redirect) {
    setTimeout(function() {
      try {
        redirect(url); 
      } catch(ex) {
        test.isTrue(/sync/.test(ex.message));
        test.equal(store, [0, 1]);
        test.isTrue(doneCalled);
        done();
      }
    }, 0);
  });

  Triggers.runTriggers(triggers, null, null, function() {
    doneCalled = true;
  });
});

Tinytest.addAsync(
'Triggers - runTriggers - redirect called multiple times',
function(test, done) {
  var store = [];
  var url = "http://google.com";
  var triggers = MakeTriggers(2, store);
  var redirectCalled = false;

  triggers.splice(1, 0, function(context, redirect) {
    redirect(url); 
    try {
      redirect(url);
    } catch(ex) {
      test.isTrue(/already redirected/.test(ex.message));
      test.equal(store, [0]);
      test.isTrue(redirectCalled);
      done();
    }
  });

  Triggers.runTriggers(triggers, null, function() {
    redirectCalled = true;
  }, null);
});

Tinytest.addAsync(
'Triggers - runTriggers - get context',
function(test, done) {
  var context = {};
  var trigger = function(c) {
    test.equal(c, context);
    done();
  };

  Triggers.runTriggers([trigger], context, function() {}, function() {});
});

function MakeTriggers(count, store) {
  var triggers = [];

  function addTrigger(no) {
    triggers.push(function() {
      store.push(no);
    });
  }

  for(var lc=0; lc<count; lc++) {
    addTrigger(lc);
  }
  return triggers;
}