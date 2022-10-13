---
order: 2
---

import Badge from '../../../src/components/Badge'

# 微应用

又称子应用，微应用通常是一个单页面应用（SPA），可能包含一个或多个路由页面，一般情况下不存在多个微应用同时运行的场景。有以下特点：

+ 本身是普通的前端应用，负责具体的业务逻辑；
+ 可以独立交付（开发、部署、运行），但是一般会集成到主应用中运行；
+ 如有必要，甚至能集成到不同的主应用中。

## 生命周期

在 icestark 中，微应用是一个 **具有生命周期** 的前端资源。icestark 中有两个生命周期，分别是：

+ 微应用挂载到主应用
+ 微应用从主应用卸载

icestark 支持两种声明生命周期的方式。分别通过全局注册的 `registerAppEnter/registerAppLeave` 以及 UMD 格式下导出的 `mount/unmount` 方法。为了跟社区的 [single-spa](https://single-spa.js.org/) 方案更好兼容，我们推荐使用后者。

#### 1. registerAppEnter/registerAppLeave

```js
import ReactDOM from 'react-dom';
import { registerAppEnter, registerAppLeave } from '@ice/stark-app';
import App from './App';

registerAppEnter((props) => {
  ReactDOM.render(<App />, props.container);
});

registerAppLeave((props) => {
  ReactDOM.unmountComponentAtNode(props.container);
});
```

#### 2. mount/unmount <Badge text="1.6.0+" />

```js
import ReactDOM from 'react-dom';
import App from './App';

export function mount(props) {
  ReactDOM.render(<App />, props.container);
}

export function unmount(props) {
  ReactDOM.unmountComponentAtNode(props.container);
}
```

## 入口规范

icestark 通过微应用入口字段的配置进行应用的渲染，因此这个字段 **非常重要**。针对不同的场景，icestark 也支持了多种入口配置形式。

### 1. url

适用于微应用入口资源比较确定，此时将这些资源地址按顺序拼成数组传给 icestark 即可。

```js
const apps = [{
  url: ['https://example.com/a.js', 'https://example.com/a.css'],
  activePath: '/foo'
  // ...
}]
```

### 2. entry <Badge text="推荐" />

使用场景：

- 应用依赖的入口资源不确定：比如需要引入 vendor、或者不确定的 externals 资源、资源地址带 hash 等场景
- 应用默认需要依赖很多 DOM 节点：比如 `jQuery`/`Kissy`/`Angular` 等框架

```js
const apps = [{
  entry: 'https://example.com/a.html',
  activePath: '/foo'
  // ...
}]
```

entry 对应 html url, icestark 对 `entry` 的处理包含以下步骤：

- 通过 `window.fetch` 获取 entry 属性对应的 html 内容
- 解析 html 内容，框架将会进行解析处理：提取 js 信息，如果资源路径为相对地址，将根据 entry 地址进行补齐
- 将处理后的 html 内容插入 icestark 动态创建的节点
- 依次通过创建 `script` 标签按顺序引入 js 资源

### 3. entryContent

当需要使用 entry 能力但是 html url 不支持前端跨域访问的情况，可以自行将 html 内容拿到，然后通过 entryContent 属性传递给 icestark。

```js
const apps = [{
  entryContent: '<!DOCTYPE html><html><body><script src=""></body></html>',
  activePath: '/foo'
  // ...
}]
```

### 4. render/component

仅使用 React 的主应用支持，具体请参考 [主应用接入 - React](../use-layout/react)。