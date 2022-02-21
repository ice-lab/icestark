---
toc: menu
order: 3
---

# 其他框架接入微应用

为一些使用 [`icejs`](https://ice.work/) 、[`create-react-app`](https://github.com/facebook/create-react-app)、umi 等三方框架的用户提供便利的接入指南。

:::tip
如果这里找不到您使用的框架类型，建议您通过 <a href="/docs/guide/use-child/react#已有-react-项目改造为微应用">微应用接入三步骤</a> 来改造您的应用。所有的改造逻辑都是相通的，也欢迎您提供 <a href="https://github.com/ice-lab/icestark/pulls">PR</a> 介绍您的接入经验。
:::

## icejs 应用

[icejs](https://ice.work/) 为 icestark 提供了专门的 [插件](https://ice.work/docs/guide/develop/plugin-dev)。更多有关 icejs 应用接入 icestark 的细节请参考 [微前端 icestark](https://ice.work/docs/guide/advance/icestark#%E5%BE%AE%E5%BA%94%E7%94%A8)。


## create-react-app 应用

> 基于 [create-react-app 4.x](https://create-react-app.dev/)

改造步骤如下：

### 安装 icestark 依赖

```shell
$ npm i @ice/stark-app --save
```

### 入口文件注册生命周期

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

+ if (!isInIcestark()) {
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById('root')
    );
+ }
```

### 修改 webpack.config.js

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

### 示例 Repo

https://github.com/maoxiaoke/icestark-cra-child


## nuxt.js 应用

> 基于 nuxt.js 2.x

[nuxt.js](https://nuxtjs.org/) 可以通过 [plugin](https://nuxtjs.org/docs/2.x/directory-structure/plugins/) 来注册微应用的生命周期。

### 新建 nuxt.js 自定义插件，并注册生命周期

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

### 引入自定义插件

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

:::tip
有关 nuxt.js 接入微应用的更多反馈和疑问，欢迎反馈至 <a href="https://github.com/ice-lab/icestark/issues/202">icestark 接入nuxt.js</a>
:::


## umi 应用

> 基于 umi 3.x

改造步骤如下：

### 安装 icestark 依赖

```shell
$ npm i @ice/stark-app --save
```

### `src` 目录下添加 `app.tsx` 文件


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

### 匹配页面路由

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

### 示例 Repo

https://github.com/maoxiaoke/icestark-umi-child

## next.js 应用

> 基于 next.js 10.x

### 定义基准路由

next.js 可以通过 [basePath](https://nextjs.org/docs/api-reference/next.config.js/basepath) 来指定。

```js
// next.config.js
module.exports = {
  basePath: '/seller'
}
```

由于 next.js 无法运行时指定 basePath，因此建议提前对基准路由进行强约定。比如约定 `http://localhost:3000/seller` 下渲染上述配置的 next 微应用。则主应用的 [path](/docs/api/ice-stark#approuter) 配置需要与之一一对应：

```js
<AppRoute
  name="seller",
  activePath="/seller"
>
</AppRoute>
```

### 微应用通过 [entry](/docs/guide/concept/child#入口规范) 方式接入

```js
<AppRoute
  name="seller",
  activePath="/seller" ,
  entry="http://localhost:3001/seller"  // 入口 html 地址
>
</AppRoute>
```

### 其他

1. next.js 微应用本地开发访问跨域时的处理

可以通过 next.js [custom server](https://nextjs.org/docs/advanced-features/custom-server) 来处理本地开发时访问跨域的问题。其中 server.js 的内容可参考：

```js
// server.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');

    handle(req, res)

  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
```

:::tip
有关 next.js 微应用接入 icestark 的更多疑问或方案，可以在这个 <a href="https://github.com/ice-lab/icestark/issues/294">issue</a>下讨论
:::


## Angular 应用

> 基于 Angular 12 (适用于 Angular 5 及以上版本)

### 定义基准路由

修改 `src/app/app-routing.module.ts` 文件，使其在 icestark 中拥有正确的基准路由。

```diff
// src/app/app-routing.module.ts

+ import { APP_BASE_HREF } from '@angular/common';
+ import getBasename from '@ice/stark-app/lib/getBasename';
+ import isInIcestark from '@ice/stark-app/lib/isInIcestark';

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  // 修改 anglur 应用的 basename
+  providers: [{ provide: APP_BASE_HREF, useValue: isInIcestark() ? getBasename() : '/' }]
})
export class AppRoutingModule { }
```

### 入口文件新增生命周期函数

`main.ts` 是 Angular 应用的入口文件，我们在这里增加 icestark 渲染所需的生命周期函数。

```ts
// src/main.ts

import { NgModuleRef } from '@angular/core';
import isInIcestark from '@ice/stark-app/lib/isInIcestark';
import setLibraryName from '@ice/stark-app/lib/setLibraryName';

// 提供 icestark 加载需要的 umd library name，可通过 webpack 配置获取
setLibraryName('angular-micro-name');

let app: void | NgModuleRef<AppModule>;

if (!isInIcestark()) {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

// 导出生命周期函数
export async function mount () {
  app = await platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

export function unmount () {
  // @ts-ignore
  app.destroy();
}
```

### 自定义 webpack 配置，将应用打包成 UMD 规范

要开启 Angular 自定义 webpack 能力，需要安装 `@angular-builders/custom-webpack`：

```shell
npm i -D @angular-builders/custom-webpack@12
```

> 建议安装与 Angular 版本对应的版本

接下来，修改配置文件 `angular.json`，找到 build 和 serve 配置，修改成下面的内容：

```diff
"build": {
-  "builder": "@angular-devkit/build-angular:browser",
+  "builder": "@angular-builders/custom-webpack:browser",
  	"options": {
+				"customWebpackConfig": {
+           "path": "custom-webpck.config.js"
+       },
			"outputPath": "dist/my-first-project",
			...
	}
},
"serve": {
-		 "builder": "@angular-devkit/build-angular:dev-server",
-    "configurations": {
-      "production": {
-        "browserTarget": "my-first-project:build:production"
-      },
-      "development": {
-        "browserTarget": "my-first-project:build:development"
-      }
-    },
-    "defaultConfiguration": "development"
+    "builder": "@angular-builders/custom-webpack:dev-server",
+     "options": {
+       "browserTarget": "my-first-project:build"
+     }
}
```

并定义 `custom-webpack.config.js` 的内容：

```js
// custom-webpack.config.js
module.exports = {
  // 提供 dev 下 cors 访问
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    // 设置 library name，该值需要与第二步的 setLibraryName 的入参保持一致
    library: `angular-micro-name`,
    // 将应用打包 umd 规范
    libraryTarget: 'umd',
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  }
}
```

### 给 Angular 加上一个唯一标识 id

为防止 Angualr 与其他 Angular 应用冲突，建议给 `<app-root>` 加上一个唯一的 id，比如当前应用的名称：

```html
// src/index.html

- <app-root></app-root>
+ <app-root id="angular-app"></app-root>
```

在 `src/app/app.component.ts` 修改 Angular 挂载的节点：

```ts
// src/app/app.component.ts

@Component({
  // 增加唯一标识 id，防止命名冲突
- selector: 'app-root',
+ selector: '#angular-app app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-first-project';
}
```

### 使用 entry 或 entryContent 接入

由于 Angular 默认渲染在 `<app-root></app-root>` 节点，因此建议通过 [entry](/docs/guide/concept/child#2-entry) 或 [entryContent](https://micro-frontends.ice.work/docs/guide/concept/child#3-entrycontent) 的方式接入。比如 Angular 应用部署在 `http://localhost:3333`，则主应用配置建议配置如下：

```js
<AppRouter>
  <AppRoute
    title="Angular 应用"
    entry="http://localhost:3333"
  />
  ...
</AppRouter>
```

### 示例 Repo

https://github.com/maoxiaoke/icestark-angular-12


## Vite 应用

icestark 在 [v2.6.0](/blog/02-icestark-2-6-0) 版本开始支持 ES modules 类型微应用的加载。由于目前 [Vite](https://vitejs.dev/) 是目前最为流行的基于 ES modules 的构建工具，因此本章节介绍 Vite 应用接入 icestark 的具体步骤。

### 定义生命周期函数

首先，在 Vite 应用的入口文件（Vue 应用通常是 `main.t|js`，React 应用通常是 `app.t|jsx`）定义生命周期函数，以 Vue 应用为例：

```diff
import { createApp } from 'vue'
+ import type { App as Root} from 'vue';
import App from './App.vue'
+ import isInIcestark from '@ice/stark-app/lib/isInIcestark';


- createApp(App).mount('#app');

+ let vue: Root<Element> | null = null;

// 不在 icestark context，保持独立运行
+ if (!isInIcestark()) {
+  createApp(App).mount('#app');
+ }


// 导出 mount 生命周期函数
+ export function mount({ container }: { container: Element}) {
+  vue = createApp(App);
+  vue.mount(container);
+ }


// 导出 unmout 生命周期函数
+ export function unmount() {
+  if (vue) {
+    vue.unmount();
+  }
}
```

### 修改 Vite 配置文件

Vite 应用默认使用根目录下的 `index.html` 作为入口文件，并通过解析 `index.html` 的 `<script />` 标签生成一个 “虚拟的” 脚本资源入口文件，会导致 icestark 无法获取导出的生命周期函数。

我们提供两种方式修改 Vite 配置文件，使得 icestark 可以正确获取生命周期函数。用户可以根据自己的实际情况进行选择。

1. 使用 [Vite Lib 模式](https://vitejs.dev/guide/build.html#library-mode)

Vite Lib 模式可以完全指定入口文件。这种方式的缺点是 Vite 会只输出应用的样式和脚本文件，如果应用需要单独运行，还需要手动提供 `index.html` 文件。

配置如下：

```diff
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
+  build: {
+    lib: {
+      entry: './src/main.ts',
+      formats: ['es'],
+      fileName: 'index'
+    },
+    rollupOptions: {
+      preserveEntrySignatures: 'exports-only',
+    }
+  },
})
```

2. 使用 [vite-plugin-index-html](https://www.npmjs.com/package/vite-plugin-index-html) 插件

为了解决 Vite Lib 模式产生的问题，我们提供了 [vite-plugin-index-html](https://www.npmjs.com/package/vite-plugin-index-html) 插件，这个插件提供了类似 [html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/) 的能力。

在使用这个插件时，需要指定应用的入口文件（Vue 应用通常是 `main.t|js`，React 应用通常是 `app.t|jsx`））。使用如下：


```diff
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
+ import htmlPlugin from 'vite-plugin-index-html';

export default defineConfig({
  plugins: [
    vue(),
+   htmlPlugin({
+     input: './src/main.ts', // 指定确定的入口文件
+     preserveEntrySignatures: "exports-only", // 确保入口文件导出生命周期函数
+   })
  ],

})
```

### 配置基准路由

对于基准路由的配置，可以依照 [React 微应用接入](/docs/guide/use-child/react#2-%E5%AE%9A%E4%B9%89%E5%9F%BA%E5%87%86%E8%B7%AF%E7%94%B1) 和 [Vue 微应用接入](/docs/guide/use-child/vue#2-%E5%AE%9A%E4%B9%89%E5%9F%BA%E5%87%86%E8%B7%AF%E7%94%B1) 相同的方式改造接入。

### 主应用加载 Vite 应用

主应用需要通过 `loadScriptMode: import` 来加载 ES modules 类型微应用（Vite 应用）。同时由于 Vite 应用在 dev 下注入 HMR 相关的代码，因此建议通过 [entry 方式](/docs/guide/concept/child#2-entry) 接入，保证开发和生产的配置一致性。

```diff
export default class App extends React.Component {
  render() {
    return (
      <BasicLayout>
        <AppRouter>
          <AppRoute
            activePath="/seller"
            title="商家平台"
+           loadScriptMode="import" // 指定加载 ES modules 类型微应用
+           entry="https://icestark-child-seller"
          />
          <AppRoute
            activePath="/user"
            //...
          />
        </AppRouter>
      </BasicLayout>
    );
  }
}
```

### 示例 Repo

+ [icestark-vite-vue](https://github.com/maoxiaoke/icestark-vite-vue) 使用 Vite + Vue3 + VueRouter 创建的 icestark 微应用
+ [icestark-vite-react](https://github.com/maoxiaoke/icestark-vite-react) 使用 Vite + React 创建的 icestark 微应用
+ [icestark-vite-framework](https://github.com/maoxiaoke/icestark-vite-framework) 使用 ice.js Vite 模式创建的 icestark 主应用

