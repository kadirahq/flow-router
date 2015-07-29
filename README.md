
# FlowRouter SSR

This is same as FlowRouter 2.0 but with SSR support. So, for the FlowRouter related documentation, visit [here](https://github.com/kadirahq/flow-router).

## Installation

* First Remove `kadira:flow-router` or `meteorhacks:flow-router` from your app
* Then add `kadira:flow-router-ssr` with `meteor add kadira:flow-router-ssr`

## Usage

> Currently, SSR only works with React. It's technically possible to add SSR support for Blaze. But Blaze Templates are not available on the server. We'll figure our something for that.

You need to write your app with FlowRouter and [ReactLayout](https://github.com/kadirahq/meteor-react-layout). Visit here to [learn](https://kadira.io/academy/meteor-routing-guide/content/rendering-react-components) how to do that.

* Write your app in a place it's expose to both client and the server. You need to do it for both for the router and for React components.
* Use Meteor's react [integration](https://github.com/meteor/react-packages)
* Use subscriptions inside your component, so FlowRouter can detect them fetch data for SSR.
* Now your code runs on both on the client and the server, so make special attention to that. (Always, check the server console for errors)
* If you need to write client specific code, write it in `componentDidMount` life cycle method - It doesn't run on the server.

## Caching

Rendering React Components are extremely [CPU intensive](https://twitter.com/kadirahq/status/620467416749838336) on the server. We can't really expect that for a production app.

So, we must run some sort of caching layer. So, FlowRouter by default has a 30 sec cache for all the pages. We define page by a unique URL. (not for a route) Currently now it's set globally. You can change it with:

~~~js
if(Meteor.isServer) {
  var timeInMillis = 1000 * 10; // 10 secs
  FlowRouter.setPageCacheTimeout(timeInMillis)
}
~~~

> Use `0` as `timeInMillis` to turn off caching

This is a smart cache and once your DDP connection sends actual data, cache will get invalidated. 

## Can I use this on Production?

It's depend on how you write your app. We are 80% feature complete and now we can call this is in alplha stage. At Kadira we use this in production for our main site. <https://kadira.io>.

But, we might have breaking changes. We'll try to maintain semvar, but that's not a promise.
