# Flow Router [![Build Status](https://travis-ci.org/meteorhacks/flow-router.svg?branch=master)](https://travis-ci.org/meteorhacks/flow-router) [![Stories in Ready](https://badge.waffle.io/meteorhacks/flow-router.svg?label=doing&title=Activities)](http://waffle.io/meteorhacks/flow-router)


Carefully Designed Client Side Router for Meteor. 

Flow Router is a minimalistic router which only handles routing and subscriptions. You can't have any kind of reactive code inside the router. But there is a rich reactive API to watch changes in the routes.

## TOC

* [Getting Started](#getting-started)
* [Routes Definition](#routes-definition)
* [Subscription Management](#subscription-management)
* [Rendering and Layout Management](#rendering-and-layout-management)
* [Triggers](#triggers)
* [Middlewares](#middlewares)
* [Not Found Routes](#not-found-routes)
* [API](#api)
* [Difference with Iron Router](#difference-with-iron-router)

## Getting Started

Add Flow Router to your app:

~~~shell
meteor add meteorhacks:flow-router
~~~

Let's write our first route (add this file to `lib/router.js`):

~~~js
FlowRouter.route('/blog/:postId', {
    subscriptions: function(params) {
        console.log("subscribe and register this subscription as 'myPost'");
        this.register('myPost', Meteor.subscribe('blogPost', params.postId));
    },
    action: function(params) {
        console.log("Yeah! We are on the post:", params.postId);
    }
});
~~~

Then visit `/blog/my-post-id` from the browser or invoke the following command from the browser console:

~~~js
FlowRouter.go('/blog/my-post-id');
~~~

Then you can see some messages printed in the console.

## Routes Definition

Flow Router routes are very simple and based on the syntax of [path-to-regexp](https://github.com/pillarjs/path-to-regexp) which is used in both [Express](http://expressjs.com/) and `iron:router`.

Here's the syntax for a simple route:

~~~js
FlowRouter.route('/blog/:postId', {
    // an array of middlewares (we'll discuss about this later on)
    middlewares: [],

    // define your subscriptions
    subscriptions: function(params, queryParams) {
       
    },

    // do some action for this route
    action: function(params, queryParams) {
        console.log("Params:", params);
        console.log("Query Params:", queryParams);
    },

    name: "<name for the route>" // optional
});
~~~

So, this route will be activated when you visit a url like below:

~~~js
FlowRouter.go('/blog/my-post?comments=on&color=dark');
~~~

After you've visit the route, this will be printed in the console:

~~~
Params: {postId: "my-post"}
Query Params: {comments: "on", color: "dark"}
~~~

For a single interaction, the router only runs once. That means, after you've visit a route, first it will call `middlewares`, then `subscriptions` and finally `action`. After that happens, none of those methods will be called again for that route visit.

You can define routes anywhere in the `client` directory. But, we recommend to add them in the `lib` directory. Then `fast-render` can detect subscriptions and send them for you (we'll talk about this is a moment).

### Group Routes

You can group routes for better route organization. Here's an example:

~~~js
var adminRoutes = FlowRouter.group({
  prefix: '/admin',
  subscriptions: function() {
    this.register('adminSettings', Meteor.subscribe('settings', {admin: true}));
  },
  middlewares: [
    function(path, next) {
      console.log('running group middleware');
      next();
    }
  ]
});

// handling /admin route
adminRoutes.route('/', {
  action: function() {
    FlowLayout.render('componentLayout', {content: 'admin'});
  },
  middlewares: [
    function(path, next) {
      console.log('running /admin middleware');
      next();
    }
  ]
});

// handling /admin/posts
adminRoutes.route('/posts', {
  action: function() {
    FlowLayout.render('componentLayout', {content: 'posts'});
  }
});
~~~

**All of the options for the `FlowRouter.group()` are optional.**

You can even have nested group routes as shown below:

~~~js
var adminRoutes = FlowRouter.group({
    prefix: "/admin"
});

var superAdminRoutes = adminRoutes.group({
    prefix: "/super"
});

// handling /admin/super/post
superAdminRoutes.route('/post', {
    action: function() {

    }
});
~~~

## Subscription Management 

Flow Router does only registration of subscriptions. It does not wait until subscription became ready. This is how to register a subscription.

~~~js
FlowRouter.route('/blog/:postId', {
    subscriptions: function(params, queryParams) {
        this.register('myPost', Meteor.subscribe('blogPost', params.postId));
    }
});
~~~

We can also register global subscriptions like this:

~~~js
FlowRouter.subscriptions = function() {
  this.register('myCourses', Meteor.subscribe('courses'));
};
~~~

All these global subscriptions run on every route. So, pay special attention to names when registering subscriptions.

After you've registered your subscriptions, you can reactively check for the status of those subscriptions like this:

~~~js
Tracker.autorun(function() {
    console.log("Is myPost ready?:", FlowRouter.subsReady("myPost"));
    console.log("Does all subscriptions ready?:", FlowRouter.subsReady());
});
~~~

So, you can use `FlowRouter.subsReady` inside template helpers to show the loading status and act accordingly.

### FlowRouter.subsReady() with a callback

Sometimes, we need to use `FlowRouter.subsReady()` in places where an autorun is not available. One such example is inside an event handler. For such places, we can use the callback API of `FlowRouter.subsReady()`.

~~~js
Template.myTemplate.events(
   "click #id": function(){
      FlowRouter.subsReady("myPost", function() {
         // do something
      });
  }
);
~~~

> Arunoda has discussed more about Subscription Management in Flow Router in [this](https://meteorhacks.com/flow-router-and-subscription-management.html#subscription-management) blog post about [Flow Router and Subscription Management](https://meteorhacks.com/flow-router-and-subscription-management.html).

> He's showing how to build an app like this:

>![FlowRouter's Subscription Management](https://cldup.com/esLzM8cjEL.gif)

#### Fast Render
Flow Router has built in support for [Fast Render](https://github.com/meteorhacks/fast-render). 

- `meteor add meteorhacks:fast-render`
- Put `router.js` in a shared location. We suggest `lib/router.js`.

You can exclude Fast Render support by wrapping the subscription registration in an `isClient` block:

~~~js
FlowRouter.route('/blog/:postId', {
    subscriptions: function(params, queryParams) {
        // using Fast Render
        this.register('myPost', Meteor.subscribe('blogPost', params.postId));

        // not using Fast Render
        if(Meteor.isClient) {
            this.register('data', Meteor.subscribe('bootstrap-data');
        }
    }
});
~~~

#### Subscription Caching

You can also use [Subs Manager](https://github.com/meteorhacks/subs-manager) for caching subscriptions on the client. We haven't done anything special to make it work. It should work as it works with other routers.

## Rendering and Layout Management

Flow Router does not handle rendering or layout management. For that, you can use [Flow Layout](https://github.com/meteorhacks/flow-layout).

Then you can invoke the layout manager inside the `action` method in the router.

~~~js
FlowRouter.route('/blog/:postId', {
    action: function(params) {
        FlowLayout.render("mainLayout", {area: "blog"});
    }
});
~~~

## Triggers

Triggers are the way flow-router allows you to perform tasks before **enter** into a route and after **exit** from a route.

#### Defining triggers for a route

Here's how you can define triggers for a route:

~~~js
FlowRouter.route('/home', {
  // calls just before the action
  triggersEnter: [trackRouteEntry],
  action: function() {
    // do something you like
  },
  // calls when when we decide to move to another route
  // but calls before the next route started
  triggersExit: [trackRouteClose]
});

function trackRouteEntry(context) {
  // context is the output of `FlowRouter.current()`
  Mixpanel.track("visit-to-home", context.queryParams);
}

function trackRouteClose(context) {
  Mixpanel.track("move-from-home", context.queryParams);
}
~~~

#### Defining triggers for a group route

This is how you can define triggers to a group definition.

~~~js
var adminRoutes = FlowRouter.group({
  prefix: '/admin',
  subscriptions: function() {
    this.register('adminSettings', Meteor.subscribe('settings', {admin: true}));
  },
  triggersEnter: [trackRouteEntry],
  triggersExit: [trackRouteEntry]
});
~~~

> You can add triggers to individual routes in the group too.

#### Defining Trigges Globally

You can also define triggers globally. Here's how to do it:

~~~js
FlowRouter.triggers.enter([cb1, cb2]);
FlowRouter.triggers.exit([cb1, cb2]);

// filtering
FlowRouter.triggers.enter([trackRouteEntry], {only: ["home"]});
FlowRouter.triggers.exit([trackRouteExit], {except: ["home"]});
~~~

As you can see from the last two examples, you can filter routes using the `only` or `except` keywords. But, you can't use both `only` and `except` at once.

> If you'd like to learn more about triggers and design decisions, visit [here](https://github.com/meteorhacks/flow-router/pull/59).

## Middlewares

> Right now middlewares are deprecated. Use triggers instead. <br>
> Triggers are very similar to middlewares, but triggers don't have a `next()` argument. So, you've no way to block or wait the route.

Sometimes, you need to invoke some tasks just before entering the route. That's where middlewares come in. Here are some of the use cases for middlewares:

* Route redirecting
* Analytics
* Initialization tasks

Below is an example of implementing simple redirection logic with middlewares. It will redirect a user to the sign-in page if they are not logged in.

~~~js

FlowRouter.route('/apps/:appId', {
    middlewares: [requiredLogin],
    subscriptions: function(params) {
        
    },
    action: function(params) {

    }
});

function requiredLogin(path, next) {
  // this works only because the use of Fast Render
  var redirectPath = (!Meteor.userId())? "/sign-in" : null;
  next(redirectPath);
}
~~~

You can also write global middlewares like this:

~~~js
FlowRouter.middleware(trackingMiddleware);

function trackingMiddleware(path, next) {
    console.log("tracking path:", path);
    next();
}
~~~

## Not Found Routes

You can configure Not Found routes like this:

~~~js
FlowRouter.notFound = {
    // Subscriptions registered here don't have Fast Render support.
    subscriptions: function() {
      
    },
    action: function() {
      
    }
};
~~~

## API

Flow Router has a rich API to help you to navigate the router and reactively get information from the router.

#### FlowRouter.getParam(paramName);

Reactive function which you can use to get a parameter from the URL.

~~~js
// route def: /apps/:appId
// url: /apps/this-is-my-app

var appId = FlowRouter.getParam("appId");
console.log(appId); // prints "this-is-my-app"
~~~

#### FlowRouter.getQueryParam(queryStringKey);

Reactive function which you can use to get a value from the queryString.

~~~js
// route def: /apps/:appId
// url: /apps/this-is-my-app?show=yes&color=red

var color = FlowRouter.getQueryParam("color");
console.log(color); // prints "red"
~~~

#### FlowRouter.path(pathDef, params, queryParams)

Generate a path from a path definition. Both `params` and `queryParams` are optional.

Special characters in `params` and `queryParams` will be urlencoded.

~~~js
var pathDef = "/blog/:cat/:id";
var params = {cat: "met eor", id: "abc"};
var queryParams = {show: "y+e=s", color: "black"};

var path = FlowRouter.path(pathDef, params, queryParams);
console.log(path); // prints "/blog/met%20eor/abc?show=y%2Be%3Ds&color=black"
~~~

If there are no params or queryParams, this will simply return the pathDef as it is.

##### Using Route name instead of the pathDef

You can also use the route's name instead of the pathDef. Then, Flow Router will pick the pathDef from the given route. See the following example:

~~~js
FlowRouter.route("/blog/:cat/:id", {
    name: "blogPostRoute",
    action: function(params) {
        //...
    }
})

var params = {cat: "meteor", id: "abc"};
var queryParams = {show: "yes", color: "black"};

var path = FlowRouter.path("blogPostRoute", params, queryParams);
console.log(path); // prints "/blog/meteor/abc?show=yes&color=black"
~~~

#### FlowRouter.go(pathDef, params, queryParams);

This will get the path via `FlowRouter.path` based on the arguments and re-route to that path.

You can call `FlowRouter.go` like this as well:

~~~js
FlowRouter.go("/blog");
~~~

#### FlowRouter.setParams(newParams)

This will change the current params with the newParams and re-route to the new path.

~~~js
// route def: /apps/:appId
// url: /apps/this-is-my-app?show=yes&color=red

FlowRouter.setParams({appId: "new-id"});
// Then the user will be redirected to the following path
//      /apps/new-id?show=yes&color=red
~~~

#### FlowRouter.setQueryParams(newQueryParams)

Just like `FlowRouter.setParams`, but for queryString params.

To remove a query param set it to `null` like below:

~~~js
FlowRouter.setQueryParams({paramToRemove: null});
~~~

#### FlowRouter.getRouteName()

To get the name of the route reactively.

~~~js
Tracker.autorun(function() {
  var routeName = FlowRouter.getRouteName();
  console.log("Current route name is: ", routeName);
});
~~~

#### FlowRouter.current()

Get the current state of the router. **This API is not reactive**.
If you need to watch the changes in the path simply use `FlowRouter.watchPathChange()`.

This gives an object like this:

~~~js
// route def: /apps/:appId
// url: /apps/this-is-my-app?show=yes&color=red

var current = FlowRouter.current();
console.log(current);

// prints following object
// {
//     path: "/apps/this-is-my-app?show=yes&color=red",
//     params: {appId: "this-is-my-app"},
//     queryParams: {show: "yes", color: "red"}
//     route: {name: "name-of-the-route"}
// }
~~~

#### FlowRouter.watchPathChange()

Reactively watch the changes in the path. If you need to simply get the params or queryParams use dedicated APIs like `FlowRouter.getQueryParam()`.

~~~js
Tracker.autorun(function() {
  FlowRouter.watchPathChange();
  var currentContext = FlowRouter.current();
  // do anything with the current context
  // or anything you wish
});
~~~

#### FlowRouter.reactiveCurrent() [Deprecated]

This API is deprecated. Use `FlowRouter.watchPathChange` instead. This API won't included in the next major release. (2.x.x)

#### FlowRouter.withReplaceState(fn)
Normally, all the route changes made via APIs like `FlowRouter.go` and `FlowRouter.setParams()` add a URL item to the browser history. For example, run the following code:

~~~js
FlowRouter.setParams({id: "the-id-1"});
FlowRouter.setParams({id: "the-id-2"});
FlowRouter.setParams({id: "the-id-3"});
~~~

Now you can hit the back button of your browser two times. This is normal behaviour since users may click the back button and expect to see the previous state of the app.

But sometimes, this is not something you want. You don't need to pollute the browser history. Then, you can use the following syntax.

~~~js
FlowRouter.withReplaceState(function() {
  FlowRouter.setParams({id: "the-id-1"});
  FlowRouter.setParams({id: "the-id-2"});
  FlowRouter.setParams({id: "the-id-3"});
});
~~~

Now, there is no item in the browser history. Just like `FlowRouter.setParams`, you can use any FlowRouter API inside `FlowRouter.withReplaceState`.

> We named this function as `withReplaceState` because, replaceState is the underline API used for this functionality. Read more about [replace state & the history API](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history).

#### FlowRouter.reload()

FlowRouter routes are idempotent. That means, even if you call `FlowRouter.go()` to the same URL multiple times, it only activates in the first run. This is also true for directly clicking on paths.

So, if you really need to reload the route, this is the API you want.

## Difference with Iron Router

Flow Router and Iron Router are two different routers. Iron Router tries to be a full featured solution. It tries to do everything including routing, subscriptions, rendering and layout management.

Flow Router is a minimalistic solution focused on routing with UI performance in mind. It exposes APIs for related functionality.

Let's learn more about the differences:

### Rendering 

Flow Router doesn't handle rendering. By decoupling rendering from the router it's possible to use any rendering framework, such as [Flow Layout](https://github.com/meteorhacks/flow-layout) to render with Blaze's Dynamic Templates, React, or Polymer. Rendering calls are made in the the route's action. 

### Subscriptions

With Flow Router, you can register subscriptions, but there is no concept like Iron Router's **waitOn**. Instead Flow Router provides a [reactive API](#subscription-management) to check the state of subscriptions. You can use that to achieve similar functionality in the template layer. 

### Reactive Content

In Iron Router you can use reactive content inside the router, but any hook or method can re-run in unpredictable manner. Flow Router limits reactive data sources to a single run when it is first called.

We think, that's the way to go. Router is just a user action. We can work with reactive content in the rendering layer. 

### router.current() is evil

`Router.current()` is evil. Why? Let's look at following example. Imagine we've a route like this in our app:

~~~
/apps/:appId/:section
~~~

Now let's say, we need to get `appId` from the URL. Then we will do, something like this in Iron Router.

~~~js
Templates['foo'].helpers({
    "someData": function() {
        var appId = Router.current().params.appId;
        return doSomething(appId);
    }
});
~~~

Okay. Let's say we changed `:section` in the route. Oh then above helper also gets rerun. Even if we add a query param to the URL, it gets rerun. That's because `Router.current()` looks for changes in the route(or URL). But in any of above cases, `appId` didn't get changed.

Because of this, a lot parts of our app gets re run and re-rendered. This creates unpredictable rendering behavior in our app.

Flow Router fixes this issue simply by providing the `Router.getParam()` API. See how to use it: 

~~~js
Templates['foo'].helpers({
    "someData": function() {
        var appId = FlowRouter.getParam('appId');
        return doSomething(appId);
    }
});
~~~

### No data context

Flow Router does not have a data context. Data context has the same problem as reactive `.current()`. We believe, it'll possible to get data directly in the template (component) layer.

### Built in Fast Render Support

Flow Router has built in [Fast Render](https://github.com/meteorhacks/fast-render) support. Just add Fast Render to your app and it'll work. Nothing to change in the router.

For more information check [docs](#fast-render).

### Server Side Routing

Flow Router is a client side router and it **does not** support sever side routing at all. But `subscriptions` run on the server to enabled Fast Render support.

#### Reason behind that

Meteor is not a traditional framework where you can send HTML directly from the server. Meteor needs to send a special set of HTML to the client initially. So, you can't directly send something to the client your self.

Also, in the server we need look for different things compared with the client. For example:

* In server we've to deal with headers.
* In server we've to deal with methods like `GET`, `POST`, etc. 
* In server we've Cookies

So, it's better to use a dedicated server-side router like [`meteorhacks:picker`](https://github.com/meteorhacks/picker). It supports connect and express middlewares and has a very easy to use route syntax.

#### Server Side Rendering (SSR)

Although, we don't have server side routes, we **will** have server side rendering support. We've some initial plans to achieve SSR and it's the main feature of version 3.0.

We may have our own initial HTML rendering system to allow SSR bypassing meteor's default layout.
