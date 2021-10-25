---
toc: menu
---

import Badge from '../../src/components/Badge'

# @ice/stark

`@ice/stark` 包含主应用运行的核心逻辑，只需在主应用中使用。

可以按照下面的方式导入这些函数：

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
} from '@ice/stark/lib/apps';
```

## AppConfig

`AppConfig` 定义一个微应用的结构，使用方式如下：

```js
// 1. 传递给 AppRoute 的 props
<AppRoute
  name="seller"
  activePath="/seller"
  url={[
    '/js/index.js',
    '/css/index.js'
  ]}
>

// 2. Api 方式通过 `registerMicroApps` 注册
registerMicroApps([{
  name="seller"
  activePath="/seller"
  url={[
    '/js/index.js',
    '/css/index.js'
  ]}
}])
```

`AppConfig` 类型定义如下：

```ts
interface AppConfig {
  name?: string;
  url?: string | string[];
  activePath?: ActivePath;
  container?: HTMLElement;
  status?: string;
  sandbox?: boolean | SandboxProps | SandboxConstructor;
  entry?: string;
  entryContent?: string;
  basename?: string;
  umd?: boolean;
  loadScriptMode?: 'fetch' | 'script' | 'import';
  checkActive?: (url: string) => boolean;
  appAssets?: Assets;
  props?: object;
  cached?: boolean;
  title?: string;
  scriptAttributes?: ScriptAttributes;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  hashType?: boolean | HashType;
}
```

各字段详细介绍如下：

### name

微应用唯一标识（必填）：

- 类型：`string`
- 默认值：无

### title

页面标题（选填）：

- 类型：`sting`
- 默认值：无

### activePath

微应用激活规则，其类型定义如下：

```ts
interface PathData {
  value: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  hashType?: boolean | HashType;
}

type MixedPathData = Array<string | PathData>;

type ActivePath = string | PathData | string[] | PathData[] | MixedPathData | (url: string) => boolean;
```

`activePath` 可以配置成以下的形式：

```ts
// 1. 匹配单路由
{
  activePath: '/seller', // 路由匹配 /seller 时激活微应用
}

// 2. 匹配多路由
{
  activePath: ['/user', '/admin'], // 路由匹配 /user 或者 /admin 时激活
}

// 3. 添加匹配限制条件
{
  // 路由匹配精准配 /user 或者 匹配到 /admin 时激活
  activePath: [{ path: '/user', exact: true }, {'/admin', exact: false }],
}

// 4. 自定义匹配逻辑
{
  activePath: (url) => {
    return url.includes('/user');
  },
}
```

### container

微应用挂载 DOM 节点

- 类型：`HTMLElement`
- 默认值：`-`

### url

微应用静态资源对应的 cdn 地址，当渲染微应用时，会将此 `url` 内的 js、css 资源加载进来（必填）。

- 类型：`string | string[]`
- 默认值：`-`

### entry

微应用对应的 html 入口，当渲染微应用时，会通过 `window.fetch` 将 html 内容获取过来，然后 `append` 至动态创建的节点（选填）。

- 类型：`string`
- 默认值：`-`

### entryContent

直接配置微应用的 html 内容。当渲染微应用时，会 `append` 至动态创建的节点（选填）。

- 类型：`string`
- 默认值：`-`

> 一般应用于需要用 html 入口但不支持跨域获取资源的场景

### umd <Badge text="@depreated" />

> @depreated，请使用 `loadScriptMode`。

标识微应用是否是一个标准的 UMD 微应用

- 类型：`boolean`
- 默认值：`false`

### exact

完全匹配，参考 [Route.exact](https://reacttraining.com/react-router/web/api/Route/exact-bool)（选填）。

- 类型：`boolean`
- 默认值：`false`

### strict

严格匹配，参考 [Route.strict](https://reacttraining.com/react-router/web/api/Route/strict-bool)（选填）。

- 类型：`boolean`
- 默认值：`false`

### sensitive

区分大小写，参考 [Route.strict](https://reacttraining.com/react-router/web/api/Route/strict-bool)（选填）。

- 类型：`boolean`
- 默认值：`false`

### hashType

微应用路由以 `hash` 路由的方式接入（选填）。

- 类型：`boolean`
- 默认值：`false`

### sandbox

微应用开启沙箱运行环境（选填）。

- 类型：`boolean | Sandbox`
- 默认值：`false`

### props <Badge text="2.0.0+" />

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

### cached

是否开启微应用切换时缓存（选填）。详细用法见 [性能优化](/docs/guide/advanced/performance#cached)

- 类型：`boolean`
- 默认值：`false`


### loadScriptMode <Badge text="2.0.0+" />

微应用 JavaScript 资源加载方式。当值 `fetch` 时，会通过 `window.fetch` (若AppRouter 提供了 `fetch` 参数，则会使用自定义 `fetch`) 请求资源；值为 `script`，会使用 `<script />` 标签加载资源；值为 `import`，则支持 es module 类型微应用。选填。

- 类型： `fetch | script | import`
- 默认值：`script`

### scriptAttributes <Badge text="2.4.0+" />

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


## StartConfiguration

`StartConfiguration` 定义 icestark 运行时可选的参数配置，包含一些常见的 Hooks 以及自定义配置。类型定义如下：

```ts
onAppEnter?: (appConfig: AppConfig) => void;
onAppLeave?: (appConfig: AppConfig) => void;
onLoadingApp?: (appConfig: AppConfig) => void;
onFinishLoading?: (appConfig: AppConfig) => void;
onError?: (err: Error) => void;
onActiveApps?: (appConfigs: AppConfig[]) => void;
fetch?: Fetch;
shouldAssetsRemove?: (
  assetUrl?: string,
  element?: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement,
) => boolean;
onRouteChange?: (
  url: string,
  pathname: string,
  query: object,
  hash?: string,
  type?: RouteType | 'init' | 'popstate' | 'hashchange',
) => void;
prefetch?: Prefetch;
basename?: string;
```

各字段详细介绍如下：

### onActiveApps

微应用开始被激活的回调（选填）

- 类型：`Function(appConfig[])`
- 默认值：`-`

### onAppEnter

微应用渲染前的回调（选填）

- 类型：`Function(appConfig)`
- 默认值：`-`

### onAppLeave

微应用卸载前的回调（选填）

- 类型：`Function(appConfig)`
- 默认值：`-`

### onLoadingApp

微应用开始加载的回调（选填）

- 类型：`Function(appConfig)`
- 默认值：`-`

### onFinishLoading

微应用结束加载的回调（选填）

- 类型：`Function(appConfig)`
- 默认值：`-`

### onError

微应用加载过程发生错误的回调（选填）

- 类型：`Function(error)`
- 默认值：`-`

### shouldAssetsRemove

判断页面资源是否持久化保留（选填）

- 类型：`Function(assetUrl, element)`
- 默认值：`() => true`

### fetch

自定义 fetch（选填）。

- 类型：`Function(assetUrl)`
- 默认值：`window.fetch`

### prefetch

预加载微应用资源（选填）。

- 类型：`Boolean | string[] | Function(app)`
- 默认值：`undefined`

### basename <Badge text="2.5.0+" />

- 微应用路由匹配统一添加 basename，选填
- 类型：`string`
- 默认值：`''`


## React 组件

对于 React 用户，我们封装了底层 API 的部分能力，以便用户可以通过 React 组件的方式快速接入 icestark。了解更多请移步 [主应用接入 - React](/docs/guide/use-layout/react)。

以下 api 均从 `@ice/stark` 导出。

```js
import { AppRouter, AppRoute } from '@ice/stark';
```

### AppRouter

定位微应用渲染节点，其 props 参数扩展至 [StartConfiguration](#startconfiguration)。类型定义如下：

```ts
interface AppRouterProps extends StartConfiguration {
  ErrorComponent?: React.ComponentType | React.ReactElement;
  LoadingComponent?: React.ComponentType | React.ReactElement;
  NotFoundComponent?: React.ComponentType | React.ReactElement;
}
```

新增字段介绍如下：

#### ErrorComponent

传入一个 React Component，在微应用加载过程中出现错误时渲染（可选）。

- 类型：`React.ComponentType | React.ReactElement`
- 默认值：`-`

#### LoadingComponent

传入一个 React Component，在微应用加载过程中时渲染（可选）。

- 类型：`React.ComponentType | React.ReactElement`
- 默认值：`-`

#### NotFoundComponent

传入一个 React Component，在无匹配路由时渲染（可选）。

- 类型：`React.ComponentType | React.ReactElement`
- 默认值：`-`

### AppRoute

微应用注册组件，组件 `Props` 的类型定义如下：

```ts
interface AppRouteProps extends AppConfig {
  component?: React.ReactElement;
  render?: (componentProps: AppRouteComponentProps) => React.ReactElement;
  path?: string | string[] | PathData[];
}
```

:::info
在使用 `<AppRoute />` 渲染微应用是，无需再提供 `container` 参数。一个最简的例子如下：

```jsx
<AppRoute
  name="seller"
  activePath="/seller"
  url={[
    '/js/index.js',
    '/css/index.js'
  ]}
>
```
:::

除 [AppConfig](#appconfig) 所定义的参数之外，`<AppRoute>` 还支持以下属性：

#### component

当路由匹配是直接渲染 react component，渲染后会带上 `location`、`match`、`history` 的 `props`, 支持 `AppRoute` 替代 `react-route` 的基本能力。**当配置此属性时，`url` 等配置会失效**。参考 [Route.component](https://reacttraining.com/react-router/web/api/Route/component)，选填

- 类型：`string | ReactNode`
- 默认值：`-`

#### render

支持 `AppRoute` 替代 `react-route` 的基本能力。**当配置此属性时，`url` 等配置会失效**。参考 [Route.render](https://reacttraining.com/react-router/web/api/Route/render-func)，选填

- 类型：`({location, match, history}) => ReactNode`
- 默认值：`-`

#### path <Badge text="@depreated" />

该字段已处于 `@depreated`，在未来的版本中，该字段可能会被移除。 请使用 [activePath](#activepath)。

## 核心 API

icestark 底层能力已完全与框架解耦。这些能力使得您可以使用 [api 的方式](/docs/guide/use-child/vue) 接入 icestark。其中包含的 API 有：

### registerMicroApps <Badge text="2.0.0+" />

用于注册微应用信息，`registerMicroApps(appConfigs: AppConfig[])`。

### removeMicroApps <Badge text="2.0.0+" />

移除已注册微应用信息，`removeMicroApps(appNames: string[])`

入参为已注册的 appNames 的信息。

```ts
import { removeMicroApps } from '@ice/stark';

removeMicroApps(['app1', 'app2']);
```

### start

通过 `start` 开始劫持路由变化，触发微应用的挂载/卸载。类型定义如下：

```js
function start(options?: StartConfiguration): void
```

入参为 [StartConfiguration](#startconfiguration)。示例如下：

```js
registerMicroApps([
  {
    name: 'app1',
    activePath: ['/', '/message', '/about'],
    container: appContainer,
    url: ['//unpkg.com/icestark-child-common/build/js/index.js'],
  }
])

start({
  onAppEnter: (appConfig) => {
    console.log(`${appConfig.name} entered.`)
  }
})
```

### createMicroApp <Badge text="2.0.0+" />

手动加载微应用，类型定义如下：

```ts
function createMicroApp(app: string | AppConfig, appLifecyle?: AppLifecylceOptions, configuration?: StartConfiguration): Promise<MicroApp>
```

使用该 api 的通用场景是无需 icestark 提供的运行时能力，手动指定在某行为下触发渲染微应用。示例如下：

```js
const App = () => {
  const container = useRef(null);

  useEffect(() => {
    createMicroApp({
      name: 'microApp',
      url: ['//unpkg.com/icestark-child-common/build/js/index.js'],
      container: container.current,
    })
    return () => {
      unmountMicroApp('microApp')
    }
  }, [])

  return (
    <div ref>
  )
}
```


### unmountMicroApp <Badge text="2.0.0+" />

手动卸载微应用，`unmountMicroApp(appName)`

### unloadMicroApp <Badge text="2.0.0+" />

手动移除微应用，`unloadMicroApp(appName)`

> 同 unmountMicroApp 区别：unmountMicroApp 仅仅执行了微应用的 unmount 方法，从节点上移除微应用，下一次挂载时可以直接执行 mount 重新挂载；而 unloadMicroApp 除了执行 unmount 方法之外，还会将微应用执行结果（mount/unmount）移除，下一次挂载该微应用时，需要重新加载资源执行来获取其生命周期。



