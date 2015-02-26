# Flow Router [![Build Status](https://travis-ci.org/meteorhacks/flow-router.svg?branch=master)](https://travis-ci.org/meteorhacks/flow-router)

Carefully Designed Client Side Router for Meteor. 

Flow Router is a minilamitic router which only does routing and handling subscriptions. You can't have anykind of reactive code inside the router. But it exposes few reactive apis to dynamically change your app based on the state of the router.

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
        console.log("subscribing and name the subscription as 'myPost'");
        this.subscribe('myPost', Meteor.subscribe('blogPost', params.postId));
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

Flow Routes are very simple and it's based on the syntax of [path-to-js](https://github.com/pillarjs/path-to-regexp). Which is used in express and iron-router.

Here's the synatx for a simple route:

~~~js
FlowRouter.route('/blog/:postId', {
    // an array of middlewares (we'll discuess this later on)
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

After you visit the route this will be printed on the console:

~~~
Params: {postId: "my-post"}
Query Params: {comments: "on", color: "dark"}
~~~

Non of the part of the router, which are "action", "subscriptions" and "middlewares" only invoke once.

You can add router inside anywhere in the `client` directory. But we recommend to add it on `lib` redirectory. Then fast-render can detect subscriptions and send them for you. (We'll talk about that later).

## Subscription Management 

Inside the route, Flow Router only register subscriptions. It does not wait for subscription getting completed. This is how to register a subscription.

~~~js
FlowRouter.route('/blog/:postId', {
    subscriptions: function(params, queryParams) {
        this.subscribe('myPost', Meteor.subscribe('blogPost', params.postId));
    }
});
~~~

We can also have global subscriptions like this:

~~~js
FlowRouter.subscriptions = function() {
  this.subscribe('myCourses', Meteor.subscribe('courses'));
};
~~~

All these global subscriptions runs on every route. So, make your special attention for names when registering subscriptions.

After you've register subscriptions, you can reactively check for the status of subscriptions like this:

~~~js
Tracker.autorun(function() {
    console.log("Read myPost:", FlowRouter.ready("myPost"));
    console.log("Read all subscriptions:", FlowRouter.ready());
});
~~~

So, you can use `FlowRouter.ready` inside template helpers to show the loading status and act accordingly.

#### Fast Render
Flow Router has the built in support for Fast Render. But, in order to activate that, you need to add `meteorhacks:fast-render` to your app. 

If you are using Fast Render, make sure to put `router.js` inside a place where it can be seen by both client and the server.

You can selectively add Fast Render support for some specific subscriptions like this:

~~~js
FlowRouter.route('/blog/:postId', {
    subscriptions: function(params, queryParams) {
        // has the fast render support
        this.subscribe('myPost', Meteor.subscribe('blogPost', params.postId));

        // does not have the fast render support
        if(Meteor.isClient) {
            this.subscribe('data', Meteor.subscribe('bootstrap-data');
        }
    }
});
~~~

#### Subscription Caching

You can also you [Subs Manager](https://github.com/meteorhacks/subs-manager) for caching subscriptions on the client. We haven't done anything special to make it work. It should work as it works with other routers.

## Rendering and Layout Management

Flow Router does not handle rendering or layout management. For that, we can use [Flow Layout](https://github.com/meteorhacks/flow-layout).

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

You can handle Not Found routes like this. You can also register subscriptions in the not found route. But, you don't have the fast-render support.

~~~js
FlowRouter.notfound = {
    subscriptions: function() {
      
    },
    action: function() {
      
    }
};
~~~

## API

We've some utility API to help you to navigate the router and get information from the router.

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

#### FlowRouter.path(pathDef, params, queryString)

Generate a path from a path definition. Both params and queryString are optional. For an example:

~~~js
var pathDef = "/blog/:cat/:id";
var params = {cat: "meteor", id: "abc"};
var queryParams = {show: "yes", color: "black"};

var path = FlowRouter.path(pathDef, params, queryString);
console.log(path); // prints "/blog/meteor/abc?show=yes&color=black"
~~~

If there is not params and queryString, this will simply send the pathDef as it is.

#### FlowRouter.go(pathDef, params, queryString);

This will get a path via `FlowRouter.path` based on the arguments and re-route to that path.

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

Just like `FlowRouter.setParams`, but for quertString params.

#### FlowRouter.current()

Get the current state of the router. This API is not reactive. You don't need to use this most of the time. You can use reactive APIs like `FlowRouter.getParam()` and `FlowRouter.getQueryParams()` instead.

> We have make this as non rective function to reduce the unnecessory re-renders in your UI.

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