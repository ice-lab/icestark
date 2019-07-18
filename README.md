English | [简体中文](./README.zh-CN.md)

# icestark

> Large-scale mid-background multi-application coexistence solution.

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

`icestark` is a solution for multi-application coexistence of large-scale mid-background, contains:

- Combine multiple SPA applications in a modular fashion based on route
- Maintain repository independence across multiple applications for business decoupling, independent development and deployment
- Unified portal, page style through a common framework application
- With few retrofit costs, existing reacting applications can be migrated to the icestark system
- Retain the SPA-level user experience


### Application architecture

![Application architecture](https://img.alicdn.com/tfs/TB1p_pgaQT2gK0jSZFkXXcIQFXa-1363-1386.png)

- Framework application and sub-application split according to UI structure
- Framework application: responsible for sub-applications registration, loading, common content display (Common Header, Common Sidebar, Common Footer, etc.)
- Sub-application: responsible for content display related to its own business

### Compatibility

`icestark` supports coexistence of different versions of react, it is recommended to use react version 15+ , react-router version 4+

## 快速开始

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
        >
          <AppRoute
            path={['/', '/list', '/detail']}
            basename="/"
            exact
            title="商家平台"
            url={[
              '//g.alicdn.com/icestark-demo/child/0.2.1/js/index.js',
              '//g.alicdn.com/icestark-demo/child/0.2.1/css/index.css',
            ]}
          />
          <AppRoute
            path="/waiter"
            basename="/waiter"
            title="小二平台"
            url={[
              '//g.alicdn.com/icestark-demo/child2/0.2.0/js/index.js',
              '//g.alicdn.com/icestark-demo/child2/0.2.0/css/index.css',
            ]}
          />
        </AppRouter>
        <div>this is common footer</div>
      </div>
    );
  }
}
```
> `icestark` 通过 `AppRouter` 控制子应用的渲染位置，通过 `AppRoute` 配置子应用对应的 `path`、`basename` 等子应用生效路由信息，以及 `url` 配置子应用对应的静态资源路径。`icestark` 会根据当前的 `pathname` 信息自动加载对应子应用的静态资源，并渲染至相应位置。

## API

### AppRouter

### AppRoute

### AppLink

### getBasename

### getMountNode

### renderNotFound

### appHistory

## Todos

- [ ] js、css 隔离方案优化
- [ ] 支持非 react 体系

## Contributors

欢迎反馈问题 [issue 链接](https://github.com/alibaba/ice/issues/new) 如果对 `icestark` 感兴趣，欢迎参考 [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) 学习如何贡献代码。

## License

[MIT](LICENSE)
