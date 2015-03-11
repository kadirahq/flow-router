# Flow Router [![Build Status](https://travis-ci.org/meteorhacks/flow-router.svg?branch=master)](https://travis-ci.org/meteorhacks/flow-router)

Carefully Designed Client Side Router for Meteor. 

Flow Router is a minilamitic router which only does routing and handling subscriptions. You can't have any kind of reactive code inside routes. But it exposes few reactive apis to dynamically change your app based on the state of the router.

## TOC

* [Getting Started](#getting-started)
* [Routes Definition](#routes-definition)
* [Subscription Management](#subscription-management)
* [Rendering and Layout Management](#rendering-and-layout-management)
* [Middlewares](#middlewares)
* [Not Found Routes](#not-found-routes)
* [API](#api)

## Getting Started

Add Flow Router into your app:

~~~shell
meteor add meteorhacks:flow-router
~~~


Let's write our first route:
(Add this file to `lib/router.js`)

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

Then visit `/blog/my-post-id` from the browser or invoke following command from the browser console:

~~~js
FlowRouter.go('/blog/my-post-id');
~~~

Then you can see some messages printed on the console.

## Routes Definition

Flow Router routes are very simple and based on the syntax of [path-to-regexp](https://github.com/pillarjs/path-to-regexp) which is used in both express and iron-router.

Here's the synatx for a simple route:

~~~js
FlowRouter.route('/blog/:postId', {
    // an array of middlewares (we'll discuess about this later on)
    middlewares: [],

    // define your subscriptions
    subscriptions: function(params, queryParams) {
       
    },

    // do some action for this route
    action: function(params, queryParams) {
        console.log("Params:", params)
        console.log("Query Params:", queryParams)
    }
});
~~~

So, this route will be activated when you visit a url like below:

~~~js
FlowRouter.go('/blog/my-post?comments=on&color=dark')
~~~

After you've visit the route, this will be printed on the console:

~~~
Params: {postId: "my-post"}
Query Params: {comments: "on", color: "dark"}
~~~

For a single interaction, router only runs once. That means, after you've visit a route, first it will call `middlewares`, then `subscriptions` and finally `action`. After that happens, there is no way any of those methods to be called again for that route visit.

You can define routes anywhere in the `client` directory. But, we recommend to add it on `lib` redirectory. Then `fast-render` can detect subscriptions and send them for you. (We'll talk about this is a moment).

## Subscription Management 

Inside the route, Flow Router only register subscriptions. It does not wait for subscriptions getting completed. This is how to register a subscription.

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

All these global subscriptions runs on every route. So, make your special attention for names when registering subscriptions.

After you've register subscriptions, you can reactively check for the status of those subscriptions like this:

~~~js
Tracker.autorun(function() {
    console.log("Is myPost ready?:", FlowRouter.ready("myPost"));
    console.log("Does all subscriptions ready?:", FlowRouter.ready());
});
~~~

So, you can use `FlowRouter.ready` inside template helpers to show the loading status and act accordingly.

#### Fast Render
Flow Router has the built in support for [Fast Render](https://github.com/meteorhacks/fast-render). But, in order to activate that, you need to add `meteorhacks:fast-render` to your app. 

If you are using Fast Render, make sure to put `router.js` inside a place where it can be seen by both client and the server. That's why we suggested to put it on the `lib/router.js`.

You can selectively add Fast Render support for some specific subscriptions like this:

~~~js
FlowRouter.route('/blog/:postId', {
    subscriptions: function(params, queryParams) {
        // has the Fast Render support
        this.register('myPost', Meteor.subscribe('blogPost', params.postId));

        // don't have the Fast Render support
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

## Middlewares

Sometimes, you need to do invoke some tasks just before entering into the route. That's where middlewares comes in. Here are some of the use cases for middlewares:

* Route Redirecting
* Analytics
* Initialzation tasks

This is how we can implement the simple redirection logic with middleware. It will simply redirect user to the sign-in page if he is not a logged in user.

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

You can handle Not Found routes like this. You can also register subscriptions in the Not Found route. But, you don't have the fast-render support.

~~~js
FlowRouter.notfound = {
    subscriptions: function() {
      
    },
    action: function() {
      
    }
};
~~~

## API

Flow Router has some utility APIs to help you navigate the router and get information from the router.

#### FlowRouter.getParam(paramName);

This is a reactive function which you can use to get a param from the URL.
Eg:-

~~~js
// route def: /apps/:appId
// url: /apps/this-is-my-app

var appId = FlowRouter.getParam("appId");
console.log(appId); // prints "this-is-my-app"
~~~

#### FlowRouter.getQueryParam(queryStringKey);

This is a reactive function which you can use to get a value from the queryString.

~~~js
// route def: /apps/:appId
// url: /apps/this-is-my-app?show=yes&color=red

var color = FlowRouter.getQueryParam("color");
console.log(color); // prints "red"
~~~

#### FlowRouter.path(pathDef, params, queryParams)

Generate a path from a path definition. Both params and queryParams are optional. For an example:

~~~js
var pathDef = "/blog/:cat/:id";
var params = {cat: "meteor", id: "abc"};
var queryParams = {show: "yes", color: "black"};

var path = FlowRouter.path(pathDef, params, queryParams);
console.log(path); // prints "/blog/meteor/abc?show=yes&color=black"
~~~

If there are no params or queryParams, this will simply return the pathDef as it is.

#### FlowRouter.go(pathDef, params, queryParams);

This will get the path via `FlowRouter.path` based on the arguments and re-route to that path.

You can call `FlowRouter.go` like this as well:

~~~js
FlowRouter.go("/blog");
~~~

#### FlowRouter.setParams(newParams)

This will change the current params with the newParams and re-route to the new path. Let's look at this example:

~~~js
// route def: /apps/:appId
// url: /apps/this-is-my-app?show=yes&color=red

FlowRouter.setParams({appId: "new-id"});
// Then the user will be redirected to the following path
//      /apps/new-id?show=yes&color=red
~~~

#### FlowRouter.setQueryParams(newQueryParams)

Just like `FlowRouter.setParams`, but for queryString params.

#### FlowRouter.current()

Get the current state of the router. **This API is not reactive**. You **don't** need to use this API most of the time. You can use reactive APIs like `FlowRouter.getParam()` and `FlowRouter.getQueryParams()` instead.

> We have make this as non reactive function to reduce the unnecessary re-renders in your UI.

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
// }
~~~

#### FlowRouter.reactiveCurrent()

Sometimes we need to watch for the current route reactively. Then you can use this. But, avoid using this inside template helpers.
