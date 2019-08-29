English | [简体中文](./README.zh-CN.md)

# icestark

> Micro Frontends solution for large application.

[![NPM version](https://img.shields.io/npm/v/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark)
[![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark.svg)](https://packagequality.com/#?package=@ice%2Fstark)
[![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark)
[![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark)
[![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

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

`icestark` requires the framework application use of react version 15+, supports framework application and sub-applications using different versions of react or different technology stacks such as vue and angular

## Getting Started

### Framework

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { AppRouter, AppRoute } from '@ice/stark';

class Layout extends React.Component {
  onRouteChange = (pathname, query) => {
    console.log(pathname, query);
  }

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
            path={['/', '/list', '/detail']}
            basename="/"
            exact
            title="Merchant platform"
            url={[
              '//g.alicdn.com/icestark-demo/child/0.2.1/js/index.js',
              '//g.alicdn.com/icestark-demo/child/0.2.1/css/index.css',
            ]}
          />
          <AppRoute
            path="/waiter"
            basename="/waiter"
            title="Waiter platform"
            url={[
              '//g.alicdn.com/icestark-demo/child2/0.2.1/js/index.js',
              '//g.alicdn.com/icestark-demo/child2/0.2.1/css/index.css',
            ]}
          />
        </AppRouter>
        <div>this is common footer</div>
      </div>
    );
  }
}
```
- `AppRouter` locates the sub-application rendering node
- `AppRoute` corresponds to the configuration of a sub-application, `path` configures all route information, `basename` configures a uniform route prefix, `url` configures assets url
- `icestark` will follow the route parsing rules like to determine the current `path`, load the static resources of the corresponding sub-application, and render

### Sub-application

```javascript
// src/index.js
import ReactDOM from 'react-dom';
import { getMountNode } from '@ice/stark';
import router from './router';

ReactDOM.render(router(), getMountNode());
```
> Get the render `DOM` via `getMountNode`

```javascript
// src/router.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { renderNotFound, getBasename } from '@ice/stark';

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

## API

### AppRouter

Positioning sub-application rendering node

#### onRouteChange

- Callback when the sub-application route changes, optional
- Type: `Function(pathname, query, type)`
- Default: `-`

#### NotFoundComponent

- Rendering global 404 content, optional
- Type: `string | ReactNode`
- Default: `<div>NotFound</div>`

#### ErrorComponent

- Sub-application js bundle loading error display content, optional
- Type: `string | ReactNode`
- Default: `<div>js bundle loaded error</div>`

#### LoadingComponent

- Sub-application static resource loading display content, optional
- Type: `string | ReactNode`
- Default: `-`

#### useShadow

- Enable shadowRoot isolation css, optional
- Type: `boolean`
- Default: `false`

### AppRoute

Sub-application registration component

#### path

- Sub-application valid routing information, refer to `React Router`. For example, the default domain name is `www.icestark.com`, and `path` is set to `/user`, which means that when accessing `www.icestark.com/user`, render this Sub-application, required
- Type: `string | string[]`
- Default: `-`

#### url

- The cdn address corresponding to the assets of the sub-application, required.
- Type: `string | string[]`
- Default: `-`

#### title

- The documentTitle displayed when the sub-application is rendered, optional
- Type: `string`
- Default: `-`

#### basename

- When the sub-application is rendered, it is transparently passed to the `basename` of `React Router`, and if it is not filled, it will be obtained from `path` by default.
- Type: `string`
- Default: `Array.isArray(path) ? path[0] : path`

#### exact

- Perfect match, refer to `React Router`, optional
- Type: `boolean`
- Default: `false`

#### strict

- Refer to `React Router`, optional
- Type: `boolean`
- Default: `false`

#### sensitive

- Refer to `React Router`, optional
- Type: `boolean`
- Default: `false`

#### rootId

- The id of the DOM node rendered for the sub-application, optional
- Type: `string`
- Default: `icestarkNode`

### AppLink

Replace the `React Router`'s `Link` component, indicating that this jump needs to reload assets
Sub-application internal jumps still use `Link`

#### to

- A string representation of the location to link to, required
- Type: `string`
- Default: `-`

### getBasename

Configure the method of the `basename` parameter in the sub-application `React Router`. Generates the final result according to the `basename` or `path` configuration in `AppRoute`

- Type: `function`
- Default: `() => basename || (Array.isArray(path) ? path[0] : path)) || "/"`

### getMountNode

According to the sub-application running environment, return the sub-application loading node method

- Type: `function`
- Default: `<div id="ice-container"></div>`
- Rules: The method supports the parameter passing, and the parameter represents the default rendered DOM node. The default node only takes effect when the child application is started separately. Support `string | HTMLElement | function`, `string` indicates that the default DOM node's `id`, `function` support function returns the value as the default DOM node.

### renderNotFound

Sub-application triggers the method of rendering global 404

- Type: `function`

### appHistory

Provides a method for manually switching trigger routing jumps and reloading assets

#### appHistory.push

- Type: `Function`
- Example:

```js
import React from 'react';
import { appHistory } from '@ice/stark';

export default class SelfLink extends React.Component {
  render() {
    return (
      <span onClick={() => {
        appHistory.push('/home');
      }}>
        selfLink
      </span>
    );
  }
}
```

#### appHistory.replace

- Type: `Function`
- Example reference `appHistory.push`

## Todos

- [ ] Js, css isolation optimization

## Contributors

Feel free to report any questions as an [issue](https://github.com/alibaba/ice/issues/new), we'd love to have your helping hand on `ice-scripts`.

If you're interested in `icestark`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
