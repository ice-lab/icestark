# React 微应用接入

## 通过脚手架创建

> 该官方脚手架基于 [icejs](https://ice.work/) 框架。

```bash
$ npm init ice icestark-child @icedesign/stark-child-scaffold
```

## 已有 React 项目改造为微应用

### 1. 应用入口适配

将 React 应用改造为微应用，只需要导出对应的生命周期即可：

```js
import ReactDOM from 'react-dom';
import { isInIcestark, setLibraryName } from '@ice/stark-app';
import App from './App';

export function mount(props) {
  ReactDOM.render(<App {...customProps} />, props.container);
}

export function unmount(props) {
  ReactDOM.unmountComponentAtNode(props.container);
}

// 注意：`setLibraryName` 的入参需要与 webpack 工程配置的 output.library 保持一致
setLibraryName('microApp');

if (!isInIcestark()) {
  ReactDOM.render(<App />, document.getElementById('ice-container'));
}
```

### 2. 定义基准路由

正常情况下，注册微应用时会为每个微应用分配一个基准路由比如 `/seller`，当前微应用的所有路由需要定义在基准路由之下，社区常见的路由库都可以通过参数非常简单的实现该功能。微应用可以通过 `getBasename()` API 获取自身的基准路由。

React 项目中使用 `react-router`：

```diff
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
+import { getBasename } from '@ice/stark-app';

export default () => {
  return (
+   <Router basename={getBasename()}>
      <Switch>
        // ...
      </Switch>
    </Router>
  );
};
```

### 3. 构建为 UMD 产物

入口文件通过导出 `mount`、`unmount` 等标准生命周期后，需要配置工程上的改造，才能最终导出 UMD 标准的微应用。

以 webpack 工程为例：

```js
module.exports = {
  output: {
    // 设置模块导出规范为 umd
    libraryTarget: 'umd',
    // 可选，设置模块在 window 上暴露的名称
    library: 'microApp',
  }
}
```
