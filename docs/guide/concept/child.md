# 微应用

又称子应用，微应用通常是一个单页面应用（SPA），可能包含一个或多个路由页面，一般情况下不存在多个微应用同时运行的场景。有以下特点：

+ 本身是普通的前端应用，负责具体的业务逻辑；
+ 可以独立交付（开发、部署、运行），但是一般会集成到主应用中运行；
+ 如有必要，甚至能集成到不同的主应用中。

在 icestark 中，微应用是一个 **具有生命周期** 的前端资源。icestark 中有两个生命周期，分别是：

+ 微应用挂载到主应用
+ 微应用从主应用卸载

icestark 支持两种声明生命周期的方式。分别通过全局注册的 `registerAppEnter/registerAppLeave` 以及 UMD 格式下导出的 `mount/unmount` 方法。为了跟社区的 [single-spa](https://single-spa.js.org/) 方案更好兼容，我们推荐使用后者。

#### 1. registerAppEnter/registerAppLeave

```js
import ReactDOM from 'react-dom';
import { getMountNode, registerAppEnter, registerAppLeave } from '@ice/stark-app';
import App from './App';

registerAppEnter(() => {
  ReactDOM.render(<App />, getMountNode());
});
registerAppLeave(() => {
  ReactDOM.unmountComponentAtNode(getMountNode());
});
```

#### 2. mount/unmount

> @ice/stark 版本 1.6.0 以上支持

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
