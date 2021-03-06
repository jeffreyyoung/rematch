# React Navigation Plugin

React-Navigation

## Installation

```
npm install react-navigation @rematch/react-navigation
```

## Example

See [an example](./examples/demo).

## Setup

Setting up React-Navigation with Redux is a multistep process. Hopefully this plugin simplifies the process.

1. Create your `<Routes />`, and select the name of your `initialRouteName`.

```js
// Routes.js
export default StackNavigator(
  {
    Landing: {
      screen: Screen.Landing,
    },
    Login: {
      screen: Screen.Login,
    },
    App: {
      screen: App,
    },
  },
  {
    initialRouteName: 'Landing',
  }
)

```

2. Pass `Routes` and `initialRouteName` into `createReactNavigationPlugin`. 

```js
// index.js
import { init, dispatch } from '@rematch/core'
import createReactNavigationPlugin from '@rematch/react-navigation'
import * as ReactNavigation from 'react-navigation'
import Routes from './Routes'

// add react navigation with redux
const { Navigator, reactNavigationPlugin } = createReactNavigationPlugin({
  Routes,
  initialScreen: 'Landing'
})

const store = init({
  plugins: [reactNavigationPlugin],
})

export default () => (
  <Provider store={store}>
    <Navigator />
  </Provider>
)
```

3. Use the plugins included navigation helpers to simplify dispatching Navigation actions.

```js
// included in plugin
dispatch.nav.navigate = (action) => dispatch(NavigationActions.navigate(action))
dispatch.nav.reset = (action) => dispatch(NavigationActions.reset(action))
dispatch.nav.back = (action) => dispatch(NavigationActions.back(action))
dispatch.nav.setParams = (action) => dispatch(NavigationActions.setParams(action))
```

Just pass the NavigationAction options.

```js
// somewhere in your app
import { dispatch } from '@rematch/core'

dispatch.nav.navigate({ routeName: 'Login' })
```

If necessary, import `NavigationActions`.

```js
import { dispatch } from '@rematch/core'
import { NavigationActions } from 'react-navigation'

const resetAction = dispatch.navigate.reset({
  index: 1,
  actions: [
    NavigationActions.navigate({ routeName: 'Profile'}),
    NavigationActions.navigate({ routeName: 'Settings'})
  ]
})
```

## Back Handler

An example for setting up the Android back button handling with react-navigation. 

```js
import { dispatch, init, getState } from '@rematch/core'
import createReactNavigation from '@rematch/react-navigation'
import React from 'react'
import { BackHandler } from 'react-native'
import { Provider } from 'react-redux'
import { Routes } from './Routes'

export class App extends React.Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBack)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBack)
  }
  
  handleBack = () => {
    if (getState().nav.index === 0) {
      BackHandler.exitApp()
    }
    dispatch.nav.back()
    return true
  }

  render() {
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    );
  }
}
```

## Selectors

You may find it helpful to add some custom selectors to your `nav` model.  You can easily add selectors by creating a `nav` model configuration object.  This example will add a `currentRouteName` selector:

```js
// models/nav.js
export default {
  selectors: {
    currentRouteName(state) { return state.routes[state.index].routeName; },
  },
}
```

Add the above model to your rematch configuration:

```js
// models/index.js
export { default as nav } from './nav'
```

Ensure your new model in included in your `init`:

```js
import { select } from '@rematch/select'
import * as models from './models'

const store = init({
  models,
  plugins: [select, reactNavigationPlugin],
});
```

Of course, you will also need to install the
[Rematch Select plugin](https://github.com/rematch/rematch/blob/master/plugins/select/README.md).

Now you will be able to call `select.nav.currentRouteName(state)` from within your app. See  the [Rematch Select plugin documentation](https://github.com/rematch/rematch/blob/master/plugins/select/README.md) for more details on how to configure and use selectors.
