---
title: icestark 2.6.0
author: 那吒
author_url: https://github.com/maoxiaoke
author_image_url: https://avatars.githubusercontent.com/u/13417006?v=4
tags: [v2, announcement]
description: Announcing icestark 2.6.0
hide_table_of_contents: false
---

## Announcing icestark 2.6.0

非常期待地告诉大家，在 [2.6.0](https://github.com/ice-lab/icestark/pull/369) 这个版本中，我们支持了 es module 模块类型的微应用。也就是说，如果您使用 [Vite](https://vitejs.dev/) 或者 [icejs Vite 模式](https://ice.work/docs/guide/basic/Vite/) 开发的应用，可以使用 icestark 来构建您的微应用。

本次更新主要包括：
- [支持 es module 类型微应用](#支持-es-module-类型微应用)
- [支持 Angular 微应用](#支持-angular-微应用)
- [修复 location.hash 赋值 onRouteChange 触发两次的错误](#修复对-locationhash-赋值-onroutechange-触发两次的错误)
- [对项目配置的改造](#对项目配置的改造)

<!--truncate-->

### 支持 es module 类型微应用

[es module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) 模块规范是面向未来的模块规范，诸如 [Vite](https://vitejs.dev/)、[snowpack](https://www.snowpack.dev/) 等原生支持 es module 的构建工具的产生，以及 [现代浏览器](https://web.dev/publish-modern-javascript/) 对 es module 语法的支持，相信未来会有越来越多的微应用构建在 native es module 之上。相比传统的构建工具（比如 webpack），这些新型的构建工具或多或少地带来了以下优势：

+ **由于无需打包的特性，服务器启动时间超快**
+ **项目大小不再成为服务器启动速度的限制因素**
+ **HMR 始终保持快速更新**

随着 [icejs](https://ice.work/) 支持 [Vite](https://ice.work/docs/guide/basic/Vite/) 模式，icestark 也为大家带来了 es module 类型微应用的支持。

框架应用接入 es module 微应用的方式非常简单，配置 `loadScriptMode: import` 来支持 es module 类型微应用的加载。

```diff
<AppRouter>
  <AppRoute
    title="商家平台"
+   loadScriptMode="import"
    url={[
      '//unpkg.com/icestark-child-seller/build/js/index.js', // 资源 es module 入口
      '//unpkg.com/icestark-child-seller/build/css/index.css',
    ]}
  />
  <AppRoute
    path="/user"
    //...
  />
</AppRouter>
```

对于 Vite 应用的 icestark 适配，可参考 [其他框架接入微应用 - Vite 应用](http://localhost:3000/docs/guide/use-child/others#Vite-%E5%BA%94%E7%94%A8) 进行配置。后期，我们将提供 Vite plugin 能力，使 Vite 应用的接入非常简单。

对于 ice.js 子应用，只需将 [`build-plugin-icestark`](https://ice.work/docs/guide/advanced/icestark) 升级到最新版本，并开启 [icejs Vite 模式](https://ice.work/docs/guide/basic/Vite)，即可完成改造工作。


### es module 微应用的常见问题解答

#### 框架应用需要是 Vite 应用吗？

**不需要**。框架应用可以使用 webpack 等非 es module 构建工具，无需对框架应用进行任何构建上的改造。对于框架应用，唯一需要做的是：升级最新的 icestark 版本，并设置 es module 微应用的加载方式（`loadScriptMode` 字段） 设置为 `import` 即可。

#### 支持沙箱模式吗？

暂不支持沙箱模式。

#### 为什么要使用 es module 微应用

除了本地开发的优秀体验，由于 es module 脚本[只执行一次](https://dmitripavlutin.com/javascript-module-import-twice/)的策略，微应用二次加载的速度基本没有延迟。

#### 浏览器的版本支持

由于 icestark 内部使用 [dynamic import](https://github.com/tc39/proposal-dynamic-import) 来支持 es module 应用，因此支持 chrome 63 版本以上的浏览器。

:::tip
有关使用 es module 的其他疑问，欢迎通过 [issue](https://github.com/ice-lab/icestark/issues) 或 [discussion](https://github.com/ice-lab/icestark/discussions) 告知我们。
:::

### 支持 Angular 微应用

Angular 1.x 应用我们建议通过 [entry](/docs/guide/concept/child#2-entry) 方式接入，因为我们没有比较好的方式来定义 [生命周期函数](/docs/guide/concept/child#生命周期)。在 Angular 5.x 及以上的版本，我们可以通过 [bootstrapModule](https://angular.io/api/core/PlatformRef#bootstrapModule) 获取到 NgModule 实例。因此可以通过下面的方式定义生命周期函数：

```ts
import { NgModuleRef } from '@angular/core';

let app: void | NgModuleRef<AppModule>;

if (!isInIcestark()) {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

export async function mount () {
  app = await platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

export function unmount () {
  // @ts-ignore
  app.destroy();
}
```

同时，为了适配 Angular 应用，icestark 做了如下改动：

+ 兼容 Angular 的 `<base />` 元素 - icestark 现在会默认解析 entry 或 entryContent 中的 `<base>` 元素的 `href`，并将其作为该微应用最终的 publicPath 的一个基准因子。解析完成后，该 `<base >` 元素不会出现在 DOM 结构中（否则可能修改其他应用的资源地址）。

### 修复对 location.hash 赋值 onRouteChange 触发两次的错误

由于对 `window.location.hash` 进行赋值，会触发 popstate 和 hashchange 两个事件，导致钩子函数 [onRouteChange](http://localhost:3000/docs/api/ice-stark#startconfiguration) 触发两次。版本 2.6.0 修复了这个问题。


### 对项目配置的改造

由于 icestark 内部使用 [dynamic import](https://github.com/tc39/proposal-dynamic-import) 来支持 es module 应用，因此需要对 icestark 工程进行一些适配，保证 dynamic import 不会被转译。项目 `tsconfig.json` 的改动如下：

```js
{
    "compilerOptions": {
      "target": "es5",
-      "module": "commonjs",
+      "module": "esnext",
+      "moduleResolution": "Node",
+      "allowSyntheticDefaultImports": true,
+      "esModuleInterop": true
      ...
    }
  },
}
```

也就是说，之前版本的 icestark 的默认产物是 commonjs 规范；2.6.0 的版本的默认产物会是 es module 规范。

## 后续的版本计划

我们会持续扩展 icestark 的能力，提升微前端体验。在接下来的版本中，我们会：

+ 为 Vite 微应用提供对应的改造插件
+ 优化开发者开发体验，dev 下提供关键路径的 log 信息
