// a set of utility functions for triggers

Triggers = {};

// Apply filters for a set of triggers
// @triggers - a set of triggers
// @filter - filter with array fileds with `only` and `except`
//           support only either `only` or `except`, but not both
Triggers.applyFilters = (triggers, filter) => {
  if (!(triggers instanceof Array)) {
    triggers = [triggers];
  }

  if (!filter) {
    return triggers;
  }

  if (filter.only && filter.except) {
    throw new Error("Triggers don't support only and except filters at once");
  }

  if (filter.only && !(filter.only instanceof Array)) {
    throw new Error('only filters needs to be an array');
  }

  if (filter.except && !(filter.except instanceof Array)) {
    throw new Error('except filters needs to be an array');
  }

  if (filter.only) {
    return Triggers.createRouteBoundTriggers(triggers, filter.only);
  }

  if (filter.except) {
    return Triggers.createRouteBoundTriggers(triggers, filter.except, true);
  }

  throw new Error('Provided a filter but not supported');
};

//  create triggers by bounding them to a set of route names
//  @triggers - a set of triggers
//  @names - list of route names to be bound (trigger runs only for these names)
//  @negate - negate the result (triggers won't run for above names)
Triggers.createRouteBoundTriggers = (triggers, names, negate) => {
  const namesMap = {};

  names.forEach((name) => {
    namesMap[name] = true;
  });

  const filteredTriggers = triggers.map((originalTrigger) => {
    const modifiedTrigger = (context, next) => {
      const routeName = context.route.name;
      let matched = namesMap[routeName] ? 1 : -1;
      matched = negate ? matched * -1 : matched;

      if (matched === 1) {
        originalTrigger(context, next);
      }
    };
    return modifiedTrigger;
  });

  return filteredTriggers;
};

//  run triggers and abort if redirected or callback stopped
//  @triggers - a set of triggers
//  @context - context we need to pass (it must have the route)
//  @redirectFn - function which used to redirect
//  @after - called after if only all the triggers runs
Triggers.runTriggers = (triggers, context, redirectFn, after) => {
  let abort = false;
  let inCurrentLoop = true;
  let alreadyRedirected = false;

  for (let lc = 0; lc < triggers.length; lc++) {
    const trigger = triggers[lc];
    trigger(context, doRedirect, doStop);

    if (abort) {
      return;
    }
  }

  // mark that, we've exceeds the currentEventloop for
  // this set of triggers.
  inCurrentLoop = false;
  after();

  function doRedirect(url, params, queryParams) {
    if (alreadyRedirected) {
      throw new Error('already redirected');
    }

    if (!inCurrentLoop) {
      throw new Error('redirect needs to be done in sync');
    }

    if (!url) {
      throw new Error('trigger redirect requires an URL');
    }

    abort = true;
    alreadyRedirected = true;
    redirectFn(url, params, queryParams);
  }

  function doStop() {
    abort = true;
  }
};
