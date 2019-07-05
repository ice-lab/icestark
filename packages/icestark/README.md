# icestark

> Icestark is a JavaScript library for multiple react projects, Ice workbench solution.

[![NPM version](https://img.shields.io/npm/v/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark)
[![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark.svg)](https://packagequality.com/#?package=@ice/stark)
[![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark)
[![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark)
[![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Installation

```bash
npm install @ice/stark --save
```

## Example

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
          useShadow
        >
          <AppRoute
            path={['/', '/home', '/about']}
            exact
            title="主页"
            url={[
              '//g.alicdn.com/icestark-demo/child/0.1.2/js/index.js',
              '//g.alicdn.com/icestark-demo/child/0.1.2/css/index.css'
            ]}
          />
          <AppRoute
            path="/user"
            title="用户页面"
            url={[
              '//g.alicdn.com/icestark-demo/child2/0.1.2/js/index.js',
              '//g.alicdn.com/icestark-demo/child2/0.1.2/css/index.css'
            ]}
          />
        </AppRouter>
        <div>this is common footer</div>
      </div>
    );
  }
}
```

## Configuration

### AppRouter

|     Property      |              Description              |     Type     | Default |
| :---------------: | :-----------------------------------: | :----------: | :-----: |
|   onRouteChange   | callback executed when route changed  |   function   |  noop   |
| NotFoundComponent |  render when the route changed error  | ReactElement |         |
|  ErrorComponent   | render when the assets pulls an error | ReactElement |         |
| LoadingComponent  |     render when assets is Loading     | ReactElement |         |
|     useShadow     |       whether to use shadowRoot       |   boolean    |  false  |


### AppRoute

| Property  |                    Description                    |      Type       |    Default     |
| :-------: | :-----------------------------------------------: | :-------------: | :------------: |
|   path    | app router path, reference react-router, required | string/string[] |                |
|    url    |             assets load url, required             | string/string[] |                |
| basename  |               react router basename               |     string      |                |
|   title   |                   documentTitle                   |     string      |                |
|   exact   |              reference react-router               |     boolean     |     false      |
|  strict   |              reference react-router               |     boolean     |     false      |
| sensitive |              reference react-router               |     boolean     |     false      |
|  rootId   |          id for ReactDOM render element           |     string      | 'icestarkNode' |
