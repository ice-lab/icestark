English | [简体中文](https://ice.work/docs/icestark/about)

# icestark

> Micro Frontends solution for large application. [Website docs](https://ice.work/docs/icestark/about).

[![NPM version](https://img.shields.io/npm/v/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark.svg)](https://packagequality.com/#?package=@ice%2Fstark) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Installation

```bash
npm install @ice/stark --save
```

## Documentation

[https://ice.work/docs/icestark/about](https://ice.work/docs/icestark/about)

## Introduction

`icestark` is a micro frontends solution for large application, contains:

- Modular management of multiple independent applications based on route
- Independent application independent warehouse, independent development and deployment
- Unified management page public content (Common Header, Common Sidebar, etc.)
- Support for low-cost migration
- SPA user experience

### Application architecture

![Application architecture](https://img.alicdn.com/tfs/TB167fiexD1gK0jSZFsXXbldVXa-1421-1416.png)

- Framework application and sub-application split according to UI structure
- Framework application: responsible for sub-applications registration, loading, common content display (Common Header, Common Sidebar, Common Footer, etc.)
- Sub-application: responsible for content display related to its own business

### Compatibility

`icestark` requires the framework application to use react version 15+, which has no restrictions on the technology stack of the sub-application, supports different technology stacks such as react, vue, angular, etc., and supports multi-version coexistence of the same technology stack.

## Getting Started

### Framework Application

#### setup in react app
```javascript
// src/App.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { AppRouter, AppRoute } from '@ice/stark';

class App extends React.Component {
  onRouteChange = (pathname, query) => {
    console.log(pathname, query);
  };

  render() {
    return (
      <div>
        <div>this is common header</div>
        <AppRouter
          onRouteChange={this.onRouteChange}
          ErrorComponent={<div>js bundle loaded error</div>}
          NotFoundComponent={<div>NotFound</div>}
        >
          <AppRoute
            path={['/', '/message', '/about']}
            basename="/"
            exact
            title="通用页面"
            url={['//unpkg.com/icestark-child-common/build/js/index.js']}
          />
          <AppRoute
            path="/seller"
            basename="/seller"
            title="商家平台"
            url={[
              '//unpkg.com/icestark-child-seller/build/js/index.js',
              '//unpkg.com/icestark-child-seller/build/css/index.css',
            ]}
          />
        </AppRouter>
        <div>this is common footer</div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('ice-container'));
```

- `AppRouter` locates the sub-application rendering node
- `AppRoute` corresponds to the configuration of a sub-application, `path` configures all route information, `basename` configures a uniform route prefix, `url` configures assets url
- `icestark` will follow the route parsing rules like to determine the current `path`, load the static resources of the corresponding sub-application, and render

#### setup with APIs

> supported by @ice/stark@2.0.0

```javascript
import { registerMicroApps } from '@ice/stark';

regsiterMicroApps([
  {
    name: 'app1',
    activePath: ['/', '/message', '/about'],
    exact: true,
    title: '通用页面',
    container: document.getElementById('icestarkNode'),
    url: ['//unpkg.com/icestark-child-common/build/js/index.js'],
  },
  {
    name: 'app2',
    activePath: '/seller',
    title: '商家平台',
    container: document.getElementById('icestarkNode'),
    url: [
      '//unpkg.com/icestark-child-seller/build/js/index.js',
      '//unpkg.com/icestark-child-seller/build/css/index.css',
    ],
  },
]);

start();
```

after sub-application is registered, icestark will load app according to the `activePath`.

### Sub-application

sub-application can expose lifecycles by both register and exports.

#### regsiter lifecycles

```javascript
// src/index.js
import ReactDOM from 'react-dom';
import { isInIcestark, getMountNode, registerAppEnter, registerAppLeave } from '@ice/stark-app';
import router from './router';

if (isInIcestark()) {
  const mountNode = getMountNode();

  registerAppEnter(() => {
    ReactDOM.render(router(), mountNode);
  });

  // make sure the unmount event is triggered
  registerAppLeave(() => {
    ReactDOM.unmountComponentAtNode(mountNode);
  });
} else {
  ReactDOM.render(router(), document.getElementById('ice-container'));
}

```

- Get the render `DOM Node` via `getMountNode`
- Trigger app mount manually via `registerAppEnter`
- Trigger app unmount manually via `registerAppLeave`

```javascript
// src/router.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { renderNotFound, getBasename } from '@ice/stark-app';

function List() {
  return <div>List</div>;
}

function Detail() {
  return <div>Detail</div>;
}

export default class App extends React.Component {
  render() {
    return (
      <Router basename={getBasename()}>
        <Switch>
          <Route path="/list" component={List} />
          <Route path="/detail" component={Detail} />
          <Redirect exact from="/" to="list" />
          <Route
            component={() => {
              return renderNotFound();
            }}
          />
        </Switch>
      </Router>
    );
  }
}
```

- Get the `basename` configuration in the framework application via `getBasename`
- `renderNotFound` triggers the framework application rendering global NotFound

#### exports lifecycles

exports lifecycles in sub-application: 

```javascript
import ReactDOM from 'react-dom';
import App from './app';

export function mount(props) {
  ReactDOM.render(<App />, document.getElementById('icestarkNode'));
}

export function unmount() {
  ReactDOM.unmountComponentAtNode(document.getElementById('icestarkNode'));
}

```

sub-application should be bundled as an UMD module, add the following configuration of webpack: 

```javascript
module.exports = {
  output: {
    library: 'sub-app-name',
    libraryTarget: 'umd',
  },
};
```

## Ecosystem

|    Project         |    Version                                 |     Docs    |   Description       |
|----------------|-----------------------------------------|--------------|-----------|
| [icejs] | [![icejs-status]][icejs-package] | [docs][icejs-docs] |A universal framework based on react.js|
| [icestore] | [![icestore-status]][icestore-package] | [docs][icestore-docs] |Simple and friendly state for React|
| [formily] | [![formily-status]][formily-package] | [docs][formily-docs] | Alibaba Group Unified Form Solution |
| [iceworks]| [![iceworks-status]][iceworks-package] | [docs][iceworks-docs] | Universal Application Development Pack for VS Code |

[icejs]: https://github.com/alibaba/ice
[icestore]: https://github.com/ice-lab/icestore
[iceworks]: https://github.com/ice-lab/iceworks
[formily]: https://github.com/alibaba/formily

[icejs-status]: https://img.shields.io/npm/v/ice.js.svg
[icestore-status]: https://img.shields.io/npm/v/@ice/store.svg
[iceworks-status]: https://vsmarketplacebadge.apphb.com/version/iceworks-team.iceworks.svg
[formily-status]: https://img.shields.io/npm/v/@formily/react.svg

[icejs-package]: https://npmjs.com/package/ice.js
[icestore-package]: https://npmjs.com/package/@ice/store
[iceworks-package]: https://marketplace.visualstudio.com/items?itemName=iceworks-team.iceworks
[formily-package]: https://npmjs.com/package/@formily/react

[icejs-docs]: https://ice.work/docs/guide/intro
[icestore-docs]: https://github.com/ice-lab/icestore#icestore
[iceworks-docs]: https://ice.work/docs/iceworks/about
[formily-docs]: https://formilyjs.org/

## Contributors

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestark/issues/new), we'd love to have your helping hand on `icestark`.

If you're interested in `icestark`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
