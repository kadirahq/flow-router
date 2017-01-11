// a set of utility functions for triggers

Triggers = {};

// Apply filters for a set of triggers
// @triggers - a set of triggers
// @filter - filter with array fileds with `only` and `except` 
//           support only either `only` or `except`, but not both
Triggers.applyFilters = function(triggers, filter) {
  if(!(triggers instanceof Array)) {
    triggers = [triggers];
  }

  if(!filter) {
    return triggers;
  }

  if(filter.only && filter.except) {
    throw new Error("Triggers don't support only and except filters at once");
  }

  if(filter.only && !(filter.only instanceof Array)) {
    throw new Error("only filters needs to be an array");
  }

  if(filter.except && !(filter.except instanceof Array)) {
    throw new Error("except filters needs to be an array");
  }

  if(filter.only) {
    return Triggers.createRouteBoundTriggers(triggers, filter.only);
  }

  if(filter.except) {
    return Triggers.createRouteBoundTriggers(triggers, filter.except, true);
  }

  throw new Error("Provided a filter but not supported");
};

//  create triggers by bounding them to a set of route names
//  @triggers - a set of triggers 
//  @names - list of route names to be bound (trigger runs only for these names)
//  @negate - negate the result (triggers won't run for above names)
Triggers.createRouteBoundTriggers = function(triggers, names, negate) {
  var namesMap = {};
  _.each(names, function(name) {
    namesMap[name] = true;
  });

  var filteredTriggers = _.map(triggers, function(originalTrigger) {
    var modifiedTrigger = function(context, next) {
      var routeName = context.route.name;
      var matched = (namesMap[routeName])? 1: -1;
      matched = (negate)? matched * -1 : matched;

      if(matched === 1) {
        originalTrigger.apply(this, arguments);
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
Triggers.runTriggers = function(triggers, context, redirectFn, after) {
  var abort = false;
  var inCurrentLoop = true;
  var alreadyRedirected = false;

  var triggerInvocationContext = this;
  var _goBackOnStop = false;

  for(var lc=0; lc<triggers.length; lc++) {
    var trigger = triggers[lc];
    trigger.call(triggerInvocationContext, context, doRedirect, doStop);

    if(abort) {
      // Sorry to say, quick hack like this to enable firing off exit triggers
      // again following a stop comes at a price of a repeat entry in one's
      // browser history (as the next item). Benign, perhaps, but annoying.
      //
      // This seems to be an outcome of the way FlowRouter's trigger system is
      // designed.

      if (triggerInvocationContext.stopped && _goBackOnStop) {
        var router = triggerInvocationContext.router;

        if (triggerInvocationContext.type === "exit") {
          Meteor.defer(function() {
            // FlowRouter will rebuild this eventually
            router._current = {
              // path: context.path,  // need to leave this out
              params: context.params,
              queryParams: context.queryParams,
              route: triggerInvocationContext.route,
              oldRoute: triggerInvocationContext.route,
            };

            router.__is_reentrant_following_stop_exit__ = true;
            router._page.replace(context.path);
            Meteor.defer(function() {
              if (router._page.len > 0) {
                router._page.back();
              }
            });
          });
        }

        if (triggerInvocationContext.type === "enter") {
          Meteor.defer(function() {
            router.__is_reentrant_following_stop_enter__ = true;
            router._page.back();
          });
        }
      }

      return;
    }
  }

  // mark that, we've exceeds the currentEventloop for
  // this set of triggers.
  inCurrentLoop = false;
  after();

  function doRedirect(url, params, queryParams) {
    if(alreadyRedirected) {
      throw new Error("already redirected");
    }

    if(!inCurrentLoop) {
      throw new Error("redirect needs to be done in sync");
    }

    if(!url) {
      throw new Error("trigger redirect requires an URL");
    }

    abort = true;
    alreadyRedirected = true;
    redirectFn(url, params, queryParams);
  }

  function doStop(goBackOnStop = false) {
    _goBackOnStop = goBackOnStop;
    abort = true;
    triggerInvocationContext.stopped = abort;
  }
};