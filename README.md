
# FlowRouter SSR

This is the SSR version of FlowRouter and this will be the [FlowRouter 4.0](https://kadira.io/blog/meteor/flow-router-4-0-and-future-of-routing-in-meteor). This is compatibile with FlowRouter 2.x expect for [subscription registration](https://github.com/kadirahq/flow-router#subscription-management). It has been removed from this version.

So, for the FlowRouter related documentation, visit [here](https://github.com/kadirahq/flow-router).

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

So, we must run some sort of caching layer. So, FlowRouter by default has a 30 sec cache for all the pages. We define page by a unique URL. Currently cache timeout is set globally. You can change it with:

~~~js
if(Meteor.isServer) {
  var timeInMillis = 1000 * 10; // 10 secs
  FlowRouter.setPageCacheTimeout(timeInMillis)
}
~~~

> Use `0` as `timeInMillis` to turn off caching. By default, caching is **turned off**.

This is a smart cache and once your DDP connection sends actual data, cache will get invalidated locally.

## Defer Script Loading

In a normal Meteor app we need to load 500KB - 2MB JavaScript and run those JavaScript before the browser start to render anything. So, JavaScript blocks the rendering.

FlowRouter has an option which defer script loading. Then once the browser received the html it can render without waiting for JavaScript. 

This is a huge improvement and works even with very slow internet connections. To experience this just visit <https://kadira.io>

To enable this, simply apply following:

~~~js
if(Meteor.isServer) {
  FlowRouter.setDeferScriptLoading(true);
}
~~~

> This cool feature was introduced by [@johanholmerin](https://github.com/johanholmerin)

## Can I use this on Production?

It's depend on how you write your app. We are 80% feature complete and now we can call this is in alpha stage. At Kadira we use this in production for our main site. <https://kadira.io>.

But, we might have breaking changes. We'll try to maintain semver, but that's not a promise.