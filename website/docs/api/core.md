---
toc: menu
---

import Badge from '../../src/components/Badge'

# Core

icestark 底层能力已完全与框架解耦。这些能力使得您可以使用 [api 的方式](/docs/guide/use-child/vue) 接入 icestark。可以按照下面的方式导入这些函数：

```js
import { start, registerMicroApps } from '@ice/stark';

// or
import * as icestark from '@ice/stark';
```

对于使用非 React 的用户，我们建议您直接从 `lib` 目录下导入这些方法。

```js
// 对于使用 Vue、Angular 的用户
import { start } from '@ice/stark/lib/start';
import {
  registerMicroApps,
  removeMicroApps,
  createMicroApp,
  unmountMicroApp,
  unloadMicroApp,
} from '@iice/stark/lib/apps';
```

## registerMicroApps <Badge text="2.0.0+" />


用于注册微应用信息，`registerMicroApps(appConfigs: AppConfig[])`

每一项 `AppConfig` 均包含以下配置：

#### name

微应用唯一标识（必填）：

- 类型：`string`
- 默认值：`-`

#### title

页面标题（选填）：

- 类型：`sting`
- 默认值：`-`

#### activePath

微应用激活规则（关联路由应用必填）：

- 类型：`string|string[]|PathData[]|Function`
- 默认值：`-`

activePath 支持多种形式配置：

```js
registerMicroApps([
  {
    name: 'app1',
    // 路由匹配 /seller 时激活
    activePath: '/seller',
    ...
  },
  {
    name: 'app2',
    // 路由匹配 /user 或者 /admin 时激活
    activePath: ['/user', '/admin'],
    ...
  },
  {
    name: 'app3',
    // 路由匹配精准配 /user 或者 匹配到 /admin 时激活
    activePath: [{ path: '/user', exact: true }, {'/admin', exact: false }],
    ...
  },
  {
    name: 'app4',
    activePath: (url) => {
      // 根据函数执行结果决定微应用是否激活
      return url.includes('/test');
    },
  }
])
```

#### container

微应用挂载 DOM 节点

- 类型：`HTMLElement`
- 默认值：`-`

#### url

微应用静态资源对应的 cdn 地址，当渲染微应用时，会将此 `url` 内的 js、css 资源加载进来（必填）

- 类型：`string | string[]`
- 默认值：`-`

#### entry

微应用对应的 html 入口，当渲染微应用时，会通过 `window.fetch` 将 html 内容获取过来，然后 `append` 至动态创建的节点，选填。**entry > entryContent > url**

- 类型：`string`
- 默认值：`-`

#### entryContent

直接配置微应用的 html 内容。当渲染微应用时，会 `append` 至动态创建的节点，选填。**entry > entryContent > url**

- 类型：`string`
- 默认值：`-`

> 一般应用于需要用 html 入口但不支持跨域获取资源的场景

#### umd

> @depreated，请使用 `loadScriptMode`。

标识微应用是否是一个标准的 UMD 微应用

- 类型：`boolean`
- 默认值：`false`

#### exact

- 完全匹配，参考 [Route.exact](https://reacttraining.com/react-router/web/api/Route/exact-bool)，选填
- 类型：`boolean`
- 默认值：`false`

> 配合 activePath 类型为 string | string[] 时使用

#### strict

- 严格匹配，参考 [Route.strict](https://reacttraining.com/react-router/web/api/Route/strict-bool)，选填
- 类型：`boolean`
- 默认值：`false`

> 配合 activePath 类型为 string | string[] 时使用

#### sensitive

- 区分大小写，参考 [Route.strict](https://reacttraining.com/react-router/web/api/Route/strict-bool)，选填
- 类型：`boolean`
- 默认值：`false`

> 配合 activePath 类型为 string | string[] 时使用

#### hashType

- 微应用路由以 `hash` 路由的方式接入
- 类型：`boolean`
- 默认值：`false`

> 配合 activePath 类型为非 Function 时使用

#### sandbox

微应用开启沙箱运行环境（选填）：

- 类型：`boolean | Sandbox`
- 默认值：`false`

#### props

自定义属性，会传递给微应用的 mount 方法

- 类型：`object`
- 默认值：`{}`

```js
export function mount(props) {
  const { container, customProps } = props;
  // customProps 即为主应用透传给微应用的属性
  console.log(customProps);
  ...
}
```

#### loadScriptMode <Badge text="2.0.0+" />

微应用 JavaScript 资源加载方式。当值 `fetch` 时，会通过 `window.fetch` (若AppRouter 提供了 `fetch` 参数，则会使用自定义 `fetch`) 请求资源；值为 `script`，会使用 `<script />` 标签加载资源，选填。

- 类型： `fetch | script`
- 默认值：`script`

#### scriptAttributes <Badge text="2.4.0+" />

当 [`loadScriptMode`](#loadscriptmode) 为 `script` 时，为 `<script />` 添加的自定义 [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attributes)。比如，您想为 `<script />` 标签添加 `crossorigin="anonymous"` 来解决 [`Script error`](https://help.aliyun.com/document_detail/88579.html) 问题，可以这样设置：

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

## removeMicroApps <Badge text="2.0.0+" />

移除已注册微应用信息，`removeMicroApps(appNames: string[])`

#### appNames

- 已注册微应用 name
- 类型：`string[]`

```js
import { removeMicroApps } from '@ice/stark';
removeMicroApps(['app1', 'app2']);
```

## start

通过 `start` 开始劫持路由变化，触发微应用的挂载/卸载，`start(options?)`。
启动微应用对于可以配置的参数：

#### onActiveApps

微应用开始被激活的回调（选填）
- 类型：`Function(appConfig[])`
- 默认值：`-`

#### onAppEnter

微应用渲染前的回调（选填）

- 类型：`Function(appConfig)`
- 默认值：`-`

#### onAppLeave

微应用卸载前的回调（选填）
- 类型：`Function(appConfig)`
- 默认值：`-`


#### onLoadingApp

微应用开始加载的回调（选填）
- 类型：`Function(appConfig)`
- 默认值：`-`

#### onFinishLoading

微应用结束加载的回调（选填）
- 类型：`Function(appConfig)`
- 默认值：`-`

#### shouldAssetsRemove

判断页面资源是否持久化保留（选填）

- 类型：`Function(assetUrl, element)`
- 默认值：`() => true`

#### fetch

自定义 fetch（选填）。

- 类型：`Function(assetUrl)`
- 默认值：`window.fetch`

#### prefetch

预加载微应用资源（选填）。

- 类型：`Boolean | string[] | Function(app)`
- 默认值：`undefined`

## createMicroApp <Badge text="2.0.0+" />

手动加载微应用，`createMicroApp(appConfig: AppConfig)`
AppConfig 同 `regsiterMicroApps` 配置项，手动加载的情况下一般不包含路由相关配置：activePath、hashType、excat、strict、sensitive

## unmountMicroApp <Badge text="2.0.0+" />

手动卸载微应用，`unmountMicroApp(appName)`

## unloadMicroApp <Badge text="2.0.0+" />

手动移除微应用，`unloadMicroApp(appName)`

> 同 unmountMicroApp 区别：unmountMicroApp 仅仅执行了微应用的 unmount 方法，从节点上移除微应用，下一次挂载时可以直接执行 mount 重新挂载；而 unloadMicroApp 除了执行 unmount 方法之外，还会将微应用执行结果（mount/unmount）移除，下一次挂载该微应用时，需要重新加载资源执行来获取其生命周期。


