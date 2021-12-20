---
title: icestark 2.7.0
author: 那吒
author_url: https://github.com/maoxiaoke
author_image_url: https://avatars.githubusercontent.com/u/13417006?v=4
tags: [v2, announcement]
description: Announcing icestark 2.7.0
hide_table_of_contents: false
---

## Announcing icestark 2.7.0

本次更新为大家带来了应用的细节优化，更新主要包括：

- [缓存 css 资源](#缓存-css-资源)
- [为 Vite 应用的开发者提供便捷的接入插件](#为-vite-应用的开发者提供便捷的接入插件)
- [appHistory 支持传递 state](#apphistory-支持传递-state)
- [常规的错误修复](#常规的错误修复)

<!--truncate-->

### 缓存 css 资源

持续优化微前端应用的加载体验是我们一直追求的事情。在这边版本中，在微应用的以下配置：

+ [loadScriptMode](/docs/api/ice-stark#loadscriptmode) 配置为 `fetch` 或 `import`
+ 开启脚本沙箱，即 [sandbox](/docs/api/ice-stark#sandbox) 设置为 `true` 或自定义沙箱
+ 开启 [umd: true](/docs/api/ice-stark#umd)

我们会默认缓存样式资源，以提升微应用二次加载的体验。对比如下（前图未缓存样式，二次加载有明显加载 Loading；后图为缓存样式）：

<div>
  <img src="https://gw.alicdn.com/imgextra/i3/O1CN013rJb831WMzoAOPEnY_!!6000000002775-1-tps-1500-533.gif" alt="before" />
  <img src="https://gw.alicdn.com/imgextra/i4/O1CN01CLqVV224pZSIDF0z6_!!6000000007440-1-tps-1500-533.gif" alt="after" />
</div>

为了保证用户尽可能地不产生 Break Change，以下场景不会默认缓存 css 资源：

+ 配置了 [shouldAssetsRemove](/docs/api/ice-stark#shouldassetsremove)
+ fetch 样式资源失败，使用原方式处理样式资源

### 为 Vite 应用的开发者提供便捷的接入插件

满足使用 Vite 官方应用的用户便捷地接入 icestark，我们提供了 [vite-plugin-index-html](https://github.com/alibaba/ice/tree/master/packages/vite-plugin-index-html) Vite 插件。该插件提供了类似 [webpack-html-plugin](https://github.com/jantimon/html-webpack-plugin) 的能力，会将 Vite 生成的虚拟入口，替换成用户指定的入口。

用户可按照我们的 [教程](/docs/guide/use-child/others#vite-应用) 接入。

该插件的简单用法如下：

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

### appHistory 支持传递 state

为满足用户通过 [history state](https://developer.mozilla.org/en-US/docs/Web/API/History/state) 传参的诉求，[appHistory](/docs/api/ice-stark-app#apphistory) 和 [`<AppLink />`](/docs/api/ice-stark-app#applink) 可通过第二个参数传递 state。用法如下：

```js
appHistory.push('/home?name=ice', { framework: 'icestark' });

<AppLink
  to={{
    pathname: '/waiter/list',
    search: '?name=ice',
    state: {
      framework: 'icestark'
    }
  }}
  >
  使用 AppLink 进行页面跳转
</AppLink>
```

### 常规的错误修复

- [x] 修复 [registerAppEnter](/docs/api/ice-stark-app/#registerappenter) 以及 [registerAppLeave](/docs/api/ice-stark-app/#registerAppLeave) 类型问题
- [x] 加载 esm 应用时，提供更精确的错误提示，[#466](https://github.com/ice-lab/icestark/issues/466)
- [x] 修复 AppLink 丢失 global 绑定可能导致的 Illegal invocation 问题，[#426](https://github.com/ice-lab/icestark/issues/426)
- [x] 修复使用 ice.js 插件 [build-plugin-icestark](https://ice.work/docs/guide/advanced/icestark/) 导致切换主应用路由是，造成重复渲染，[#427](https://github.com/ice-lab/icestark/issues/427)

## 后续的版本计划

我们会持续扩展 icestark 的能力，提升微前端体验。在接下来的版本中，我们会：

+ 我们会结合官网，提供详尽的报错指引
+ 提供官方的权限控制实践 ([rfcs](https://github.com/ice-lab/icestark/issues/396))
+ 以及样式隔离方案 ([rfcs](https://github.com/ice-lab/icestark/issues/413))
