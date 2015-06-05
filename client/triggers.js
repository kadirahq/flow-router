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

// Apply filters for a set of triggers
// @triggers - a set of triggers
// @filter - filter with array fileds with `only` and `except` 
//           support only either `only` or `except`, but not both
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

//  create triggers by bounding them to a set of route names
//  @triggers - a set of triggers 
//  @names - list of names to be bound (trigger runs only for these names)
//  @negate - negate the result (triggers won't run for above names)
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

//  run triggers and abort if redirected
//  @triggers - a set of triggers 
//  @context - context we need to pass (it must have the route)
//  @redirectFn - function which used to redirect 
//  @after - called after if only all the triggers runs
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