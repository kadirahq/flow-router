import chai from 'chai';

expect = chai.expect;

/**
 * Wraps a function in a try/catch statement, and calls the done function with the caught exception.
 * @param done Mocha(ish) done function.
 * @param fn function being wrapped.
 */
catchable = function(done, fn) {
  try {
    fn();
  } catch(e) {
    done(e);
  }
};

/**
 * Creates a promise out of a function that uses a callback with params: (error, result).
 * @param fn Function to wraps as a promise.
 * @param args function arguments.
 * @returns {Promise} Promise version of the function.
 */
promisify = function(fn, ...args) {
  return new Promise(function(resolve, reject) {
    args.push(function(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
    fn(...args);
  });
};
