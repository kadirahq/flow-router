## Whether to submit an issue or not?

We've very limited time to answer all the issues and respond them in a proper manner.
So, this repo's issue list only used to report **bugs** and **new features.**

For any other questions, issues or asking for best practices use [Meteor Forums](https://forums.meteor.com/).
Even before you ask a question on Meteor Forums, make sure you read the [Meteor Routing Guide](https://kadira.io/academy/meteor-routing-guide).

## Implementing Feature and Bug Fixes

We are welcome and greedy for PRs. So,

* If you wanna fix a bug, simply submit it.
* If you wanna implement feature or support with contributions, just drop a message to arunoda [at] kadira.io.

## Developing

Clone the repo:

```
git clone git@github.com:kadirahq/flow-router.git && cd flow-router
```

Install developer dependencies:

```
npm install
```

### Tests

Run tests in-browser with

```
meteor test-packages ./ --port 9001
```

or at command line with

```
npm test
```

### Linting

Please lint your code before publishing a PR.

Do so with:

```
npm run lint
```

> You can also run `npm run lint -- --fix` to automatically fix common lint issues.

That will use ESLint to lint all Javascript code in this project.

If you use GitHub's Atom editor, you can get nice inline annotations with:

```
apm install linter
apm install linter-eslint
```

We use ESLint to lint our code, with rules from [the example Meteor guide Todos app](https://github.com/meteor/todos) along with a [Meteor ESLint plugin](https://github.com/dferber90/eslint-plugin-meteor) for Meteor specific stuff.
