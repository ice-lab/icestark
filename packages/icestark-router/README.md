# icestark-router
A router package for @ice/srark

[![NPM version](https://img.shields.io/npm/v/@ice/stark-router.svg?style=flat)](https://npmjs.org/package/@ice/stark-router)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/stark-router.svg?style=flat)](https://npmjs.org/package/@ice/stark-router)

## Installation

```bash
npm install @ice/stark-router --save
```

## Example

```javascript
import React from 'react';
import StarkRouter from '@ice/stark-router';

class App extends React.Component {
  render() {
    const routers = [{
      path: '/',
      key: 'index',
      component: () => <div>index page</div>,
      exact: true,
    }, {
      path: '/home',
      key: 'home',
      component: () => <div>home page</div>,
    }, {
      path: '/about',
      key: 'about',
      component: () => <div>about page</div>,
    }];
    return (
      <div>
        <StarkRouter routers={routers}/>
      </div>
    );
  }
}
```
