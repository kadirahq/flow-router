/**
 * Holds a list of describe descriptions as we traverse the
 * describe tree.
 * @type {Array}
 */
let lst = [];

/**
 * Root describe statement, initializes a test suite.
 * @param description suite description.
 * @param fn function to be executed.
 */
describe = function (description, fn) {
  lst.push(description);

  let steps = {
    description: lst.slice(0),
    it: [],
    before: null,
    beforeEach: null,
    after: null,
    afterEach: null
  };

  this.context = _.bind(describe, this);

  this.before =  (bfn) => {
    steps.before = _.bind(bfn, this);
  };

  this.beforeEach =  (befn) => {
    steps.beforeEach = _.bind(befn, this);
  };

  this.after = (afn) => {
    steps.after = _.bind(afn, this);
  };

  this.afterEach =  (aefn) => {
    steps.afterEach = _.bind(aefn, this);
  };

  this.it =  (str, itfn) => {
    steps.it.push({
      desc: str,
      fn: _.bind(itfn, this)
    });
  };

  _.bind(fn, this)();

  _.bind(execute, this)(steps);

  lst.pop();
};

/**
 * Executes the defined steps in the proper order.
 * @param steps description object.
 */
let execute = function(steps) {

  // Create a test for before
  hookFor(steps, 'before');

  // Create tests for beforeEach, it and afterEach
  for (let itObj of steps.it) {
    hookFor(steps, 'beforeEach', itObj.desc);

    if (itObj.fn.length > 0) {
      Tinytest.addAsync(prepDesc(steps.description, itObj.desc), (test, done) => {
        tryTest(test, _.bind(itObj.fn, {}, tryDone(test, done)), done);
      })
    } else {
      Tinytest.add(prepDesc(steps.description, itObj.desc), (test) => {
        tryTest(test, itObj.fn);
      });
    }

    hookFor(steps, 'afterEach', itObj.desc);
  }
  // Create a test for after
  hookFor(steps, 'after');
};

/**
 * Define the given test hook.
 * @param steps Object that holds the available hooks and data.
 * @param when The name of the hook to be called.
 * @param append optional test to append to the test description.
 */
let hookFor = function (steps, when, append) {
  if (steps[when] !== null) {
    let str = when;
    if (append) {
      str = `${when} (${append})`;
    }
    if (steps[when].length > 0) {
      Tinytest.addAsync(prepDesc(steps.description, str), (test, done) => {
        tryTest(test, _.bind(steps[when], {}, tryDone(test, done)), done);
      });
    } else {
      Tinytest.add(prepDesc(steps.description, str), (test) => {
        tryTest(test, steps[when]);
      });
    }
  }
};

/**
 * Prepares a tinytest description by joining the describe, context, and it description with ' - '.
 * @param lst ancestors descriptions.
 * @param desc current description.
 * @returns {string} joined description.
 */
let prepDesc = function(lst, desc) {
  return lst.concat(desc).join(' - ');
};

/**
 * Wraps a synchronous tests with try/catch statements, and reports a failed test on an AssertError.
 * @param test Tinytest test function.
 * @param fn Function being wrapped.
 */
let tryTest = function(test, fn, done) {
  try {
    fn();
  } catch (e) {
    if (e.constructor.name === 'AssertionError') {
      test.equal(e.actual, e.expected, e.message);
    } else {
      test.equal(e.toString(), undefined);
    }
    if (done) {
      done();
    }
  }
};

/**
 * Create a function to replace Tinytest's "onComplete" callback, so we report the exception as a failed test.
 * @param test Tinytest test function.
 * @param done Tinytest onComplete callback.
 * @returns {Function} a Mocha(ish) compatible done function.
 */
let tryDone = function(test, done) {
  return function(assertError) {
    if (assertError) {
      if (assertError.constructor.name === 'AssertionError') {
        test.equal(assertError.actual, assertError.expected, assertError.message);
      } else {
        test.equal(assertError.toString(), undefined);
      }
    }
    done();
  }
};
