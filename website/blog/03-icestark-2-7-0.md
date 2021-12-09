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

非常高兴地告诉大家，在 [2.6.0](https://github.com/ice-lab/icestark/pull/369) 这个版本中，我们支持了 ES modules 模块类型的微应用。也就是说，如果您使用 [Vite](https://vitejs.dev/) 或者 [icejs Vite 模式](https://ice.work/docs/guide/basic/vite/) 开发的应用，可以使用 icestark 来构建您的微前端架构。

本次更新主要包括：
- [支持 ES modules 类型微应用](#支持-ES-modules-类型微应用)
- [完善 Angular 微应用支持](#支持-angular-微应用)
- [修复 location.hash 赋值 onRouteChange 触发两次的错误](#修复对-locationhash-赋值-onroutechange-触发两次的错误)
- [对项目配置的改造](#对项目配置的改造)
- [ice.js 插件支持 ES modules 资源](#ice.js-插件支持-ES-modules-资源)

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


## 后续的版本计划

我们会持续扩展 icestark 的能力，提升微前端体验。在接下来的版本中，我们会：

+ 为 Vite 微应用提供对应的改造插件
+ 优化开发者开发体验，dev 下提供关键路径的 log 信息
