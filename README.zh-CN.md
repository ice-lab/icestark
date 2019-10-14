[English](./README.md) | 简体中文

# icestark

> 面向大型应用的微前端解决方案。[文档](https://ice.work/docs/icestark/about)。

[![NPM version](https://img.shields.io/npm/v/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark.svg)](https://packagequality.com/#?package=@ice%2Fstark) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

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
// src/index.js
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

ReactDOM.render(
  <App />,
  document.getElementById('ice-container')
);
```

- `AppRouter` 定位子应用渲染节点
- `AppRoute` 设置子应用相关配置，`path` 配置有效路由信息、`basename` 配置统一的路由前缀，`url` 配置静态资源路径
- `icestark` 会按照类似 `react-router` 的路由解析规则，判断当前生效 `path`，加载对应子应用的静态资源，进行渲染

### 子应用

- 通过 `getMountNode` 获取渲染 `DOM` 节点
- 手动触发子应用 `unmount` 事件

```javascript
// src/index.js
import ReactDOM from 'react-dom';
import { getMountNode, registerAppLeave } from '@ice/stark-app';
import router from './router';

// make sure the unmount event is triggered
registerAppLeave(() => {
  ReactDOM.unmountComponentAtNode(getMountNode());
});

ReactDOM.render(router(), getMountNode());
```

- 子应用通过 `getBasename` 获取框架应用中配置的 `basename`
- `renderNotFound` 触发框架应用渲染 404

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

## API

[查看完整文档](https://ice.work/docs/icestark/api/app-router).

## Todos

- [ ] 子应用之间可能的 js 污染问题
- [ ] 框架应用和子应用之间可能的样式污染问题

## Contributors

欢迎反馈问题 [issue 链接](https://github.com/alibaba/ice/issues/new) 如果对 `icestark` 感兴趣，欢迎参考 [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) 学习如何贡献代码。

## License

[MIT](LICENSE)
