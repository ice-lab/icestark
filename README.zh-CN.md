[English](./README.md) | 简体中文

# icestark

> 面向大型应用的微前端解决方案。

[![NPM version](https://img.shields.io/npm/v/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark)
[![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark.svg)](https://packagequality.com/#?package=@ice%2Fstark)
[![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark)
[![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark)
[![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## 安装

```bash
npm install @ice/stark --save
```

## 简介

`icestark` 是面向大型应用的微前端解决方案，包含以下特性：

- 基于路由，模块化管理多个独立应用
- 不同应用独立仓库、独立开发与部署
- 统一管理页面公共内容（Common Header、Common Sidebar 等）
- 支持应用低成本迁移
- SPA 用户体验

### 应用架构

![应用架构](https://img.alicdn.com/tfs/TB1bvbieEY1gK0jSZFMXXaWcVXa-1421-1416.png)

- 按照 UI 结构进行框架应用、子应用的拆分
- 框架应用：负责子应用的注册、加载，公共内容展示（Common Header、Common Sidebar、Common Footer 等）
- 子应用：负责自身业务相关的内容展示

### 兼容性

`icestark` 要求框架应用使用 react 版本 15+，对子应用的技术栈没有限制，支持 react、vue、angular 等不同技术栈，也支持同一技术栈的多版本共存

## 快速开始

### 框架应用

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
- `AppRouter` 定位子应用渲染节点
- `AppRoute` 设置子应用相关配置，`path` 配置有效路由信息、`basename` 配置统一的路由前缀，`url` 配置静态资源路径
- `icestark` 会按照类似 `react-router` 的路由解析规则，判断当前生效 `path`，加载对应子应用的静态资源，进行渲染

### 子应用

```javascript
// src/index.js
import ReactDOM from 'react-dom';
import { getMountNode } from '@ice/stark';
import router from './router';

ReactDOM.render(router(), getMountNode());
```
> 通过 `getMountNode` 获取渲染 `DOM` 节点

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
> 子应用通过 `getBasename` 获取框架应用中配置的 `basename`
> `renderNotFound` 触发框架应用渲染 404

## API

### AppRouter

定位子应用渲染节点

#### onRouteChange

- 子应用 route 变化时的回调，选填
- 类型：`Function(pathname, query, type)`
- 默认值：`-`

#### NotFoundComponent

- 渲染全局 404 内容，选填
- 类型：`string | ReactNode`
- 默认值：`<div>NotFound</div>`

#### ErrorComponent

- 子应用 `js` 静态资源加载出错时的展示内容，选填
- 类型：`string | ReactNode`
- 默认值：`<div>js bundle loaded error</div>`

#### LoadingComponent

- 子应用静态资源加载时的展示内容，选填
- 类型：`string | ReactNode`
- 默认值：`-`

#### useShadow

- 是否开启 shadowRoot 隔离 css，选填
- 类型：`boolean`
- 默认：`false`

### AppRoute

子应用注册组件

#### path

- 子应用有效路由信息，参照 `React Router`，比如默认域名为`www.icestark.com`，`path` 设置为 `/user`，表示当访问 `www.icestark.com/user` 时，渲染此应用，必填
- 类型：`string | string[]`
- 默认值：`-`

#### url

- 子应用静态资源对应的 cdn 地址，必填
- 类型：`string | string[]`
- 默认值：`-`

#### title

- 子应用渲染时展示的 documentTitle ，选填
- 类型：`string`
- 默认值：`-`

#### basename

- 子应用运行时，透传给 `React Router` 的 `basename`，选填，如果不填，默认会从 `path` 中获取
- 类型：`string`
- 默认值：`Array.isArray(path) ? path[0] : path`

#### exact

- 是否完全匹配，参考 `React Router`，选填
- 类型：`boolean`
- 默认值：`false`

#### strict

- 参考 `React Router`，选填
- 类型：`boolean`
- 默认值：`false`

#### sensitive

- 参考 `React Router`，选填
- 类型：`boolean`
- 默认值：`false`

#### rootId

- 子应用默认加载的 DOM 节点的 id，选填
- 类型：`string`
- 默认值：`icestarkNode`

### AppLink

子应用之间跳转，替代 React Router 的 `Link` 组件，表示本次跳转需要重新加载静态资源
子应用内部跳转仍然使用 `Link`

#### to

- 目标路径，同 `Link` 中的 `to` 保持一致 ，必填
- 类型：`string`
- 默认值：`-`

### getBasename

配置子应用 `React Router` 中的 `basename` 参数的方法，根据 `AppRoute` 中的 `basename` 或者 `path` 配置生成最终结果

- 类型：`function`
- 默认值：`() => basename || (Array.isArray(path) ? path[0] : path)) || "/"`

### getMountNode

根据子应用运行环境，返回子应用渲染节点

- 类型：`function`
- 默认值：`<div id="ice-container"></div>`
- 使用规则：方法支持传参，传参代表默认渲染的 DOM 节点，默认节点只在子应用单独启动时生效。支持 `string | HTMLElement | function`， `string` 表示默认 DOM 节点的 `id`，`function` 支持函数返回值作为默认 DOM 节点

### renderNotFound

子应用触发渲染全局 404 的方法

- 类型：`function`

### appHistory

提供手动切换不同应用的方法。

#### appHistory.push

- 类型：`function`
- 代码示例：

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

- 类型：`function`
- 代码示例参考 `appHistory.push`

## Todos

- [ ] js、css 隔离方案优化

## Contributors

欢迎反馈问题 [issue 链接](https://github.com/alibaba/ice/issues/new) 如果对 `icestark` 感兴趣，欢迎参考 [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) 学习如何贡献代码。

## License

[MIT](LICENSE)
