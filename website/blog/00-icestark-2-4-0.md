---
title: icestark 2.4.0
author: 那吒
author_url: https://github.com/maoxiaoke
author_image_url: https://avatars.githubusercontent.com/u/13417006?v=4
tags: [v2, announcement]
description: Announcing icestark 2.4.0
hide_table_of_contents: false
---

## Announcing icestark 2.4.0

[icestark](https://github.com/ice-lab/icestark/releases/tag/v2.4.0) 2.4.0 发布的主要特性有：

  - [解决 Script Error 错误](#解决-script-error-错误)
  - [@ice/stark-data 支持 Symbol key](#icestark-data-支持-symbol-key)
  - [独立官网 https://micro-frontends.ice.work/](#独立官网)
  - [提供 ice 用户消费框架应用传递的 props](#提供-ice-用户消费框架应用传递的-props)
  - [增强的沙箱能力](#增强的沙箱能力)

<!--truncate-->

### 解决 Script Error 错误

微应用上线运行遇到错误时，监控平台通常会捕获到 Script Error 的输出：

![script error](https://img.alicdn.com/imgextra/i4/O1CN01BiMLFq1YXeDQVV7Ri_!!6000000003069-0-tps-680-29.jpg)

处于安全考虑，浏览器会刻意隐藏其他域的 JavaScript 文件抛出的具体错误信息，来避免敏感信息被不受控制的第三方脚本捕获。因此，浏览器只允许同域下的脚本捕获具体错误信息，而其他脚本只知道发生了一个错误，但无法获知错误的具体内容。

为解决跨域捕获 JavaScript 异常，需要为 `<script >` 添加 `crossorigin="anonymous"` 属性。

```js
<script src="http://another-domain.com/app.js" crossorigin="anonymous"></script>
```

在最新的 icestark 版本中，可以通过 `scriptAttributes` 为微应用的 JavaScript 文件添加这一属性。

```js
// 微应用配置
{
  name: 'app1',
  activePath: '/seller',
  url: [
    '//unpkg.com/app1/js/chunk.js',
    '//unpkg.com/app1/js/index.js',
    '//unpkg.com/app1/css/index.css',
  ],
  ...
  // 为微应用 app1 的所有 js 资源添加 crossorigin="anonymous"
  scriptAttributes: ["crossorigin=anonymous"],
  // or
  // 为 `//unpkg.com/app1/js/chunk.js` 资源添加 crossorigin="anonymous"
  scriptAttributes: (url) => url.includes('chunk') ? ["crossorigin=anonymous"] : [],
}
```

有关 scriptAttributes 使用的更多内容，可参考 [api - scriptAttributes](/../docs/api/ice-stark#scriptattributes)

此外，还可以通过 scriptAttributes 来为某个 JavaScript 文件做特殊的标记。比如：

```js
...
// 为微应用的 chunk 资源标记类型
scriptAttributes: (url) => url.includes('chunk') ? ["resourceType=chunk"] : [],
...
```

还需要注意的是，以下属性在 scriptAttributes 中不可设置：

+ `async`
+ `id`
+ `type`
+ `src`
+ `async`
+ `icestark`

在开发阶段，icestark 会进行 error 提示，比如试图通过 `scriptAttributes` 字段修改 JavaScript 文件的 `src`：

![](https://img.alicdn.com/imgextra/i3/O1CN01L5Sec41OdvUERElhd_!!6000000001729-0-tps-1362-282.jpg)


### @ice/stark-data 支持 Symbol key

[@ice/stark-data](/../docs/guide/advanced/communication) 是 icestark 提供的应用间通信解决方案。现在，已支持 `Symbol` 作为标识 key。

> 如果您对 Symbol 还不熟悉，可以先在这里[了解](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)下。

使用方式如下：

（1）在主应用中监听事件

```js
import { event } from '@ice/stark-data';

const sym = Symbol.for('freshMessage');

event.on('sym', () => {
  // 重新获取消息数
})
```

（2）在微应用触发事件

```js
import { event } from '@ice/stark-data';

const sym = Symbol.for('freshMessage');

event.emit('sym');
```

千万不要使用 `new Symbol()` 或 `Symbol()` 来生成 symbol，因为：

```js
Symbol('foo') !== Symbol('foo')
// true
```

### 独立官网

icestark 于前两周上线独立[官网](https://micro-frontends.ice.work/)。我们重新梳理了所有文档，并扩展了很多内容。

1. 为 [icejs](https://ice.work/)、umi、create-react-app、nuxt.js、next.js、Angular 等其他多种框架的用户提供了接入 icestark 指导，请参阅 [其他框架接入微应用](/../docs/guide/use-child/others)；

2. 为所有 api 标记了支持的版本;

![](https://img.alicdn.com/imgextra/i1/O1CN01dp76nB2A5fPvnBB6O_!!6000000008152-0-tps-956-186.jpg)

3. 以及更明显的 [FAQ 入口](/../docs/faq)。

### 提供 [ice](https://ice.work/) 用户消费框架应用传递的 props

在 [icestark 2.x](/../docs/guide/upgrade) 版本中，支持框架应用通过 [props](/../docs/api/ice-stark#props) 传递微应用自定义参数。如：

```diff
// 框架应用
const appConfig = {
  ...
  icestark: {
    type: 'framework',
    Layout: BasicLayout,
    getApps: async () => {
      const apps = [{
        path: '/seller',
        title: '商家平台',
        url: [
          '//ice.alicdn.com/icestark/child-seller-react/index.js',
          '//ice.alicdn.com/icestark/child-seller-react/index.css',
        ],
+       props: {
+         name: 'micro-child'
+       }
      }];
      return apps;
    },
   ...
  },
};
runApp(appConfig);
```

对于 ice 用户，我们提供了 [build-plugin-icestark](https://ice.work/docs/guide/advanced/icestark) 来接入 icestark。在最新的 `build-plugin-icestark` 版本中，可以通过 [页面组件](https://ice.work/docs/guide/basic/router#%E8%B7%AF%E7%94%B1%E7%BB%84%E4%BB%B6%E5%8F%82%E6%95%B0) 的 `props` 获取到框架应用传递的 props 参数。

```js
const Detail = ({ props }) => {
  const { frameworkProps: { name } } = props;
  return <div>{name}</div>;
}

export default Detail;
```

注意，您需要使用下面的指令将 `build-plugin-icestark` 升级到最新版本：

```shell
$npm i build-plugin-icestark@latest -D
```

对于还在使用 icestark 1.x 的用户，请查阅升级[指南](/../docs/guide/upgrade)。

### 增强的沙箱能力

在最新的版本中，我们修复了 `eval` 函数在沙箱中执行的一些异常行为。该行为是 `eval` 函数错误被 `bind` 导致执行作用域为全局作用域。您可以通过下面的代码简单验证：

```js
function foo (obj) {
  eval.bind(window)('console.log(obj)');
}

boo({a: 1});
// Uncaught ReferenceError: obj is not defined
```

在最新的版本中，您可以在代码中正常使用 `eval` 函数，并得到它的预期行为。

在之前的版本中，沙箱中的 [假值](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) 不会被捕获。比如：

```js
// 在沙箱中执行
window.a = false;

console.log(a);
// undefined
```

在最近的版本中，我们修正了这一行为。


## 后续的版本计划

我们会持续扩展 icestark 的能力，提升微前端体验。在接下来的版本中，我们会：

+ 优化 icestark 本地开发以及沙箱的调试体验 ([issue](https://github.com/ice-lab/icestark/issues/259))；
+ 为 [React Component](/../docs/api/ice-stark#approuter) 和 [Api](/../docs/api/ice-stark#核心-api) 的使用方式对齐所有字段。这可能会导致某些字段在未来的版本中处于 `@deprecated` 阶段 ([rfc](https://github.com/ice-lab/icestark/issues/299))；
+ 会修复使用 Prompt 组件二次弹框的问题；([issue](https://github.com/ice-lab/icestark/issues/325))；
+ 提供更简单、方便样式隔离方案。
