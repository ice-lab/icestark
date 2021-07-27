---
order: 2
---

# Vue 微应用接入

## 通过脚手架创建

> 官方脚手架基于 Vue 2.0 + Vue CLI。

```bash
$ npm init ice icestark-child @vue-materials/icestark-child-app
```

## 已有 Vue 项目改造为微应用

### 1. 应用入口适配

vue 应用改造同样在入口文件中导出微应用相关生命周期即可：

```js
// 应用入口文件 src/main.js
import Vue from 'vue';
import isInIcestark from '@ice/stark-app/lib/isInIcestark';
import setLibraryName from '@ice/stark-app/lib/setLibraryName';

let vue;

// 注意：`setLibraryName` 的入参需要与 webpack 工程配置的 output.library 保持一致
setLibraryName('microApp');

export function mount(props) {
  const { container } = props;
  vue = new Vue(...).$mount();
  // for vue don't replace mountNode
  container.innerHTML = '';
  container.appendChild(vue.$el);
}

export function unmount() {
  vue && vue.$destroy();
}

if (!isInIcestark()) {
  new Vue(...);
}
```

若使用的是 Vue 3.x，则应用需要使用 Vue 3.x 的方式进行渲染。

```js
import { createApp } from 'vue'
import App from './App.vue'
import isInIcestark from '@ice/stark-app/lib/isInIcestark';
import setLibraryName from '@ice/stark-app/lib/setLibraryName';

let vue = null;

// 注意：`setLibraryName` 的入参需要与 webpack 工程配置的 output.library 保持一致
setLibraryName('microApp')

export function mount({ container }) {
  vue = createApp(App);
  vue.mount(container);
}

export function unmount() {
  vue.unmount();
}

if (!isInIcestark()) {
  createApp(App).mount('#app');
}
```

### 2. 定义基准路由

Vue 项目中使用 `vue-router`：

```js
import Vue from 'vue';
import Router from 'vue-router';
import { getBasename } from '@ice/stark-app';
import routes from '@/config/routes';

Vue.use(Router);

export default new Router({
  routes,
  mode: 'history',
  base: getBasename(),
});
```

### 3. 构建为 UMD 产物

入口文件通过导出 mount、unmount 等标准生命周期后，需要配置工程上的改造，才能最终导出 UMD 标准的微应用。

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
