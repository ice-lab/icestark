---
title: icestark 2.5.0
author: 那吒
author_url: https://github.com/maoxiaoke
author_image_url: https://avatars.githubusercontent.com/u/13417006?v=4
tags: [v2, announcement]
description: Announcing icestark 2.5.0
hide_table_of_contents: false
---

## Announcing icestark 2.5.0

在 2.5.0 版本中，我们主要统一了在使用 [API](/docs/api/ice-stark#核心-api) 和 [React Component](/docs/api/ice-stark#react-%E7%BB%84%E4%BB%B6) 接入的一些字段使用方式，并集中修复了一些常见问题。本次更新主要包括：

+ [对齐 API 和 React Component 使用字段](#对齐-api-和-react-component-使用字段)
+ [重构路由匹配算法](#重构路由匹配算法)
+ [优化 icestark 本地开发以及沙箱的调试体验](#优化-icestark-本地开发以及沙箱的调试体验)
+ [修复使用 Prompt 组件二次弹框的问题](#修复使用-prompt-组件二次弹框的问题)

<!--truncate-->

### 对齐 API 和 React Component 使用字段

在之前的版本中，[AppConfig](/docs/api/ice-stark#appconfig) 有些字段和 `<AppRoute />` 接收的 props 存在一定的差异，对用户的使用造成了困恼。因此，我们整体梳理了相关字段，主要的变更如下：

#### 1. `<AppRoute />` 的 [path](/docs/api/ice-stark#path) 字段废弃，请使用 [activePath](/docs/api/ice-stark#activepath) 字段。

`activePath` 是 [appConfig](/docs/api/ice-stark#appconfig) 定义的基础字段，除了支持 [path](docs/api/ice-stark#path) 所有配置能力外，还支持函数写法，可自定义路由匹配逻辑：

```ts
{
  name: 'app',
  activePath: (url) => {
    return url.includes('/seller');  // 当路由匹配上 /seller，则激活应用
  }
}
```

值得注意的是，当使用函数写法的 `activePath` 是，需要有 `name` 字段标识，否则会有 Error 提示；对于其他非函数写法，icestark 会默认根据 `activePath` 的配置生成一个 `name` 值。

:::info
建议在 [配置微应用](/docs/api/ice-stark#appconfig) 时，添加 `name` 字段。
:::

#### 2. AppConfig 提供 basename 字段

[basename](/docs/api/ice-stark#basename) 字段可以方便地自定义微应用路由的 [basename](https://reactrouter.com/web/api/BrowserRouter/basename-string)。我们在 `<AppRoute />` 的 Props 支持了这一字段，但是在 AppConfig 并没有支持这一字段。比如，当使用 [createMicroApp](/docs/api/ice-stark#createmicroapp) 加载微应用时，需要通过主动调用 [setBasename](/docs/api/ice-stark-app#getbasename) 来设置 `basename`。

```js
import { createMicroApp } from '@ice/stark';
import { setBasename } from '@ice/stark-app';

setBasename('/seller');

createMicroApp({
  name: 'app',
  activePath: '/seller',
  url: ['/js/index.js'],
  container: ref.current;
});
```

现在，你可以使用 `basename` 字段：

```js
import { createMicroApp } from '@ice/stark';

createMicroApp({
  name: 'app',
  activePath: '/seller',
  basename: '/seller',
  url: ['/js/index.js'],
  container: ref.current;
});
```

#### 3. 在 `<AppRouter />` 中使用 onLoadingApp、onFinishLoading、onError 等 Hooks

在之前的版本中，使用 `<AppRoute />` 不太方便对微应用执行的各个阶段进行监控或埋点（虽然这些能力均在 [API](docs/api/ice-stark#start) 中支持）。因此，我们也在 `<AppRoute />` 中透出了这些 Hooks。

> 更多有关 [对齐 API 和 React Component 使用字段](#对齐-api-和-react-component-使用字段) 可参见 [RFC](https://github.com/ice-lab/icestark/issues/299)。


### 重构路由匹配算法

在新版本中，我们对 [路由匹配算法](https://github.com/ice-lab/icestark/blob/release/2.5.0/src/util/checkActive.ts) 进行了重构。重构之后的版本并不会影响现有的代码功能，对于这一功能的变更，我们进行了充分的测试。但如果您的应用因此受到了一些影响，欢迎通过 [issue](https://github.com/ice-lab/icestark/issues) 来告知我们。

### 优化 icestark 本地开发以及沙箱的调试体验

当我们本地开发时候，source map 对定位源码非常有效。但是使用 [fetch](http://localhost:3000/docs/api/wrapper/#loadscriptmode) 来加载 js 资源时候，由于当前 origin 是主应用的 origin，导致 source map 文件加载失败。如图：

![](https://img.alicdn.com/imgextra/i3/O1CN01Fzwbb31LpQb0uqoHy_!!6000000001348-0-tps-2996-396.jpg)

在 [Source Map Revision 3 Proposal](https://docs.google.com/document/u/0/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/mobilebasic) 中，我们找到解决这个问题的一些蛛丝马迹，通过在代码末尾添加 `//# sourceURL=<url> */` 解决这个问题。

有两点需要注意：

1. 该方式对 sandbox 同样有效，很好地缓解了 sandbox 的定位难题
2. 如果是通过 `<script />` 标签加载的资源，不受该问题限制

### 修复使用 Prompt 组件二次弹框的问题

当微应用使用 ReactRouterDOM 的 [Prompt](https://reactrouter.com/core/api/Prompt) 组件时，会出现两次 confirm 框确认，如图：

![](https://img.alicdn.com/imgextra/i2/O1CN01LRBZex1KyIeJBcoOP_!!6000000001232-1-tps-1694-546.gif)

新版本中，我们修复了这一异常行为。可以访问 [从 Prompt 来看微前端路由劫持原理](https://zhuanlan.zhihu.com/p/394624654) 了解我们对一问题的追溯。


## 后续的版本计划

我们会持续扩展 icestark 的能力，提升微前端体验。在接下来的版本中，我们会：

+ 提供更优的方式接入 es module 微应用 ([rfc](https://github.com/ice-lab/icestark/issues/346))
+ 优化 icestark 的错误提示信息 ([issue](https://github.com/ice-lab/icestark/issues/308))
+ 给新手用户提供更简单的接入指导
+ 提供多页签的微应用模板
