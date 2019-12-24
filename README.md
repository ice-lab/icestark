English | [简体中文](https://ice.work/docs/icestark/about)

# icestark

> Micro Frontends solution for large application. [Website docs](https://ice.work/docs/icestark/about).

[![NPM version](https://img.shields.io/npm/v/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark.svg)](https://packagequality.com/#?package=@ice%2Fstark) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Installation

```bash
npm install @ice/stark --save
```

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

### Sub-application

- Get the render `DOM Node` via `getMountNode`
- Trigger app mount manually via `registerAppEnter`
- Trigger app unmount manually via `registerAppLeave`

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

- Get the `basename` configuration in the framework application via `getBasename`
- `renderNotFound` triggers the framework application rendering global NotFound

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

## Todos

- [ ] Possible js pollution problem between sub-applications
- [ ] Possible style pollution between framework application and sub-application

## Contributors

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestark/issues/new), we'd love to have your helping hand on `icestark`.

If you're interested in `icestark`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
