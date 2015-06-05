/*
  Refactor info:
    * Triggers are fully handled in the router layer
    * Run all the enter triggers just before invalidating
    * If redirected, don't invalidate
    * implement exit handler for each route and run triggers
    * call that handler for each route
    * Run global exit handlers in global page exit handler
*/
// a set of utility functions for triggers

Triggers = {};

Triggers.applyFilters = functions(triggers, filter) {
  if(!(triggers instanceof Array)) {
    triggers = [triggers];
  }

  if(!filter) {
    return triggers;
  }

  if(filter.only && filter.except) {
    throw new Error("Triggers don't support only and except filters at once");
  }

  if(!(filter.only instanceof Array)) {
    throw new Error("only filters needs to be an array");
  }

  if(!(filter.except instanceof Array)) {
    throw new Error("except filters needs to be an array");
  }

  if(filter.only) {
    return createTriggers(triggers, filter.only);
  }

  if(filter.except) {
    return createTriggers(triggers, filter.except, true);
  }

  throw new Error("Provided a filter but not supported");
};

Triggers.createTriggers = function(triggers, names, negate) {
  var namesMap = {};
  _.each(names, function(name) {
    namesMap[name] = true;
  });

  var filteredTriggers = _.map(triggers, function(trigger) {
    var modifiedTrigger = function(context, next) {
      var routeName = context.route.name;
      if(namesMap[routeName] && !negate) {
        context(context, next);
      } else {
        next();
      }

    };
    return modifiedTrigger;
  });

  return filteredTriggers;
};

Triggers.runTriggers = functions(triggers, context, redirectFn, after) {
  var abort = false;
  for(var lc=0; lc<triggers.length; lc++) {
    var trigger = triggers[lc];
    trigger(context, doRedirect);

    if(abort) {
      return;
    }
  }

  // call the after function, if only all the triggered have ran
  // but not if aborted
  after();

  function doRedirect(url) {
    if(url) {
      abort = true;
      redirectFn(url);
    }
  }
};