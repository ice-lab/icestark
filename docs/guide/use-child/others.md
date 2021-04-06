---
toc: menu
---

# 其他框架接入微应用

为一些使用 [`icejs`](https://ice.work/) 、[`create-react-app`](https://github.com/facebook/create-react-app)、umi 等三方框架的用户提供便利的接入指南。

<Alert>
如果这里找不到您使用的框架类型，建议您通过 <a href="/guide/use-child/react#已有-react-项目改造为微应用">微应用接入三步骤</a> 来改造您的应用。所有的改造逻辑都是相通的，也欢迎您提供 <a href="https://github.com/ice-lab/icestark/pulls">PR</a> 介绍您的接入经验。
</Alert>

## icejs 应用

[icejs](https://ice.work/) 为 icestark 提供了专门的 [插件](https://ice.work/docs/guide/develop/plugin-dev)。更多有关 icejs 应用接入 icestark 的细节请参考 [微前端 icestark](https://ice.work/docs/guide/advance/icestark#%E5%BE%AE%E5%BA%94%E7%94%A8)。

----

## create-react-app 应用

> 基于 create-react-app 4.x

改造步骤如下：

#### 安装 icestark 依赖

```shell
$ npm i @ice/stark-app --save
```

#### 入口文件注册生命周期

打开 `src` 目录下的入口文件 `index.js`，注册子应用生命周期。

```diff
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
+ import { isInIcestark, setLibraryName } from '@ice/stark-app';

+ export function mount(props) {
+  ReactDOM.render(<App {...customProps} />, props.container);
+ }

+ export function unmount(props) {
+   ReactDOM.unmountComponentAtNode(props.container);
+ }

+ setLibraryName('microApp');

+ if (!isInIcestark) {
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById('root')
    );
+ }
```

#### 修改 webpack.config.js

在使用 `create-react-app` 创建项目后，需要 [eject](https://github.com/facebook/create-react-app#philosophy) 来支持自定义构建配置。执行命令：

```shell
$ npm run eject
```

执行完毕，项目会新增一个 `config` 目录，在 `config` 目录下找到 `webpack.config.js` 文件，新增配置：

```js
module.exports = function (webpackEnv) {
  return {
    ...
    output: {
      libraryTarget: 'umd',
      library: 'microApp',
    }
  }
}
```

----

## nuxt.js 应用

> 基于 nuxt.js 2.x

[nuxt.js](https://nuxtjs.org/) 可以通过 [plugin](https://nuxtjs.org/docs/2.x/directory-structure/plugins/) 来注册微应用的生命周期。

#### 新建 nuxt.js 自定义插件，并注册生命周期

在 `plugins` 目录下新建 `microapp.js` 文件，注册生命周期

```js
// plugins/micraopp.js
import Vue from 'vue';
import { isInIcestark, getMountNode, registerAppEnter, registerAppLeave } from '@ice/stark-app';

if (isInIcestark()) {
  let vue;
  const mountNode = getMountNode();
  registerAppEnter(() => {
    vue = new Vue(...).$mount();
    // for vue don't replace mountNode
    mountNode.innerHTML = '';
    mountNode.appendChild(vue.$el);
  });

  // make sure the unmount event is triggered
  registerAppLeave(() => {
    vue && vue.$destroy();
  });
} else {
  const vue = new Vue(...);
}
```

#### 引入自定义插件

在 `nuxt.config.js` 中引入插件，并关闭 `ssr`。

```js
// nuxt.config.js
export default {
  plugins: [{
    src: '~plugins/mircoapp.js',
    ssr: false
  }]
}
```

<Alert>
有关 nuxt.js 接入微应用的更多反馈和疑问，欢迎反馈至 <a href="https://github.com/ice-lab/icestark/issues/202">icestark 接入nuxt.js</a>
</Alert>

----

## umi 应用

> 基于 umi 3.x

改造步骤如下：

#### 安装 icestark 依赖

```shell
$ npm i @ice/stark-app --save
```

#### `src` 目录下添加 `app.tsx` 文件


在 `app.tsx` 修改子应用渲染的节点，并注册子应用生命周期。


```js
//src/app.tsx
import ReactDOM from 'react-dom';
import { isInIcestark, getMountNode, registerAppEnter, registerAppLeave } from '@ice/stark-app';

// 在 icestark 中修改渲染的节点
export function modifyClientRenderOpts(memo: any) {
  return {
    ...memo,
    rootElement: isInIcestark() ? getMountNode() : memo.rootElement
  };
}

// 为 icestark 注册生命周期
export function render (oldRender: any) {
  if (isInIcestark()) {
    registerAppEnter(() => {
      oldRender();
    });
    registerAppLeave(() => {
      ReactDOM.unmountComponentAtNode(getMountNode());
    });
  } else {
    oldRender();
  }
}
```

#### 匹配页面路由

经过上面的步骤，umi 子应用已能够正常加载。但需要正确渲染，还需要匹配当前渲染路由。比如，在子应用渲染在 `https://localhost:3333/seller` 路由下，则需要修改 umi 子应用 `.umirc.ts`，通过 `base` 属性添加路由前缀。

```js
import { defineConfig } from 'umi';

export default defineConfig({
  // 由于 umi 不支持动态修改路由前缀，因此无法使用 icestark 提供的 getBasename 方法
  // 可以通过 umi 自定义插件的能力更改 https://umijs.org/zh-CN/plugins/api#modifyroutes
  base: '/seller/',
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
});
```
