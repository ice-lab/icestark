English | [简体中文](https://ice-lab.github.io/icestark/)
# icestark

> Micro Frontends solution for large application. [Website Chinese docs](https://ice-lab.github.io/icestark/).

[![NPM version](https://img.shields.io/npm/v/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Features 🎉

- No framework constraint for main&sub applications, support React/Vue/Angular/...
- Sub-application support multiple types of entry: js&css, html entry, html content
- Compatible with [single-spa](https://single-spa.js.org/) sub-application and lifecycles
- JavaScript sandbox by `Proxy` API

## Showcases 🎃

### Vue main-application

https://icestark-vue.surge.sh/

Main-application based on Vue, And sub-applications based on React, Vue respectively.

### React main-application

https://icestark-react.surge.sh/

Main-application based on React, And sub-applications based on React, Vue, Angular respectively.

## Architecture&Concepts 🚁

<a href="https://img.alicdn.com/tfs/TB167fiexD1gK0jSZFsXXbldVXa-1421-1416.png" target="_blank"><img src="https://img.alicdn.com/tfs/TB167fiexD1gK0jSZFsXXbldVXa-1421-1416.png" height="600" /></a>

Concepts:

- Main-application: also named framework application, responsible for sub-applications registration&load&render, layout display (Header, Sidebar, Footer, etc.)
- Sub-application: responsible for content display related to its own business

## Getting Started 🥢🍚

### Use Scaffold

Main-application:

```bash
# Based on React
$ npm init ice icestark-layout @icedesign/stark-layout-scaffold
# Based on Vue
$ npm init ice icestark-layout @vue-materials/icestark-layout-app

$ cd icestark-layout
$ npm install
$ npm start
```

Sub-application:

```bash
# Based on React
$ npm init ice icestark-child @icedesign/stark-child-scaffold
# Based on Vue
$ npm init ice icestark-child @vue-materials/icestark-child-app

$ cd icestark-child
$ npm install
$ npm run start
```

### Main-application

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
            exact
            title="通用页面"
            url={['//unpkg.com/icestark-child-common/build/js/index.js']}
          />
          <AppRoute
            path="/seller"
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

sub-application can expose lifecycles in both register lifecycles and export lifecycles(umd) ways.

#### 1. regsiter lifecycles

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

#### 2. exports lifecycles(umd)

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

## Documentation 📝

[https://micro-frontends.ice.work/](https://micro-frontends.ice.work/)

## Contributors

<table>
<tr>
    <td align="center" style="word-wrap: break-word; width: 90.0; height: 90.0">
        <a href=https://github.com/maoxiaoke>
            <img src=https://avatars.githubusercontent.com/u/13417006?v=4 width="60;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=那吒/>
            <br />
            <sub style="font-size:14px"><b>那吒</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 90.0; height: 90.0">
        <a href=https://github.com/ClarkXia>
            <img src=https://avatars.githubusercontent.com/u/4219965?v=4 width="60;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=ClarkXia/>
            <br />
            <sub style="font-size:14px"><b>ClarkXia</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 90.0; height: 90.0">
        <a href=https://github.com/daysai>
            <img src=https://avatars.githubusercontent.com/u/18555391?v=4 width="60;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=daysai/>
            <br />
            <sub style="font-size:14px"><b>daysai</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 90.0; height: 90.0">
        <a href=https://github.com/imsobear>
            <img src=https://avatars.githubusercontent.com/u/2505411?v=4 width="60;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=大果/>
            <br />
            <sub style="font-size:14px"><b>大果</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 90.0; height: 90.0">
        <a href=https://github.com/temper357>
            <img src=https://avatars.githubusercontent.com/u/5419233?v=4 width="60;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=站稳/>
            <br />
            <sub style="font-size:14px"><b>站稳</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 90.0; height: 90.0">
        <a href=https://github.com/alvinhui>
            <img src=https://avatars.githubusercontent.com/u/4392234?v=4 width="60;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=许文涛/>
            <br />
            <sub style="font-size:14px"><b>许文涛</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 90.0; height: 90.0">
        <a href=https://github.com/skyFi>
            <img src=https://avatars.githubusercontent.com/u/12740180?v=4 width="60;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=Skylor.Min/>
            <br />
            <sub style="font-size:14px"><b>Skylor.Min</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 90.0; height: 90.0">
        <a href=https://github.com/liqupan>
            <img src=https://avatars.githubusercontent.com/u/21078925?v=4 width="60;"  style="border-radius:50%;align-items:center;justify-content:center;overflow:hidden;padding-top:10px" alt=liqupan/>
            <br />
            <sub style="font-size:14px"><b>liqupan</b></sub>
        </a>
    </td>
</tr>
</table>

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestark/issues/new), we'd love to have your helping hand on `icestark`.

## License

[MIT](LICENSE)
