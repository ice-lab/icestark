---
toc: menu
---

# Wrapper

对于 React 用户，我们封装了 [core 能力](./core) 以便通过 React 组件的方式快速接入 icestark。了解更多请移步 [使用 React Component 接入](/guide/use/wrapper)。

以下 api 均从 `@ice/stark` 导出。

```js
import { AppRouter, AppRoute } from '@ice/stark';
```

## AppRouter

定位微应用渲染节点，包含如下 props 属性

#### onRouteChange

- 微应用 route 变化时的回调，选填
- 类型：`Function(pathname, query, hash, type)`
- 默认值：`-`

#### NotFoundComponent

- 渲染全局 404 内容，选填
- 类型：`string | ReactNode`
- 默认值：`<div>NotFound</div>`

#### ErrorComponent

- 微应用 `js` 静态资源加载出错时的展示内容，选填
- 类型：`string | ReactNode`
- 默认值：`<div>js bundle loaded error</div>`

#### LoadingComponent

- 微应用静态资源加载时的展示内容，选填
- 类型：`string | ReactNode`
- 默认值：`-`

#### onAppEnter

- 微应用渲染前的回调，选填
- 类型：`Function(appConfig)`
- 默认值：`-`

#### onAppLeave

- 微应用卸载前的回调，选填
- 类型：`Function(appConfig)`
- 默认值：`-`

#### basename

- 微应用路由匹配统一添加 basename，选填
- 类型：`string`
- 默认值：`''`

#### shouldAssetsRemove

- 判断页面资源是否持久化保留，选填
- 类型：`Function(assetUrl, element)`
- 默认值：`() => true`

> 应用资源在 AppRouter 初始化后将默认标识为主应用资源，在微应用切换过程中不会被移除。但在主应用开启懒加载或者一些资源通过脚本异步插入到页面的场景下，这类资源无法正确被标识为不需要移除的资源，可以通过 `shouldAssetsRemove` 方式进行规则判断

```js
<AppRouter
  shouldAssetsRemove={(url, el) => {
    // 如果资源 url 链接包含 icestark.com 则标识为主应用资源，微应用切换时不需要移除
    return url.match(/icestark.com/) ? false : true;
  }}
>
</AppRouter>
```

#### fetch

自定义 fetch（选填）。

- 类型：`Function(assetUrl)`
- 默认值：`window.fetch`

#### prefetch
预加载微应用资源（选填）。

- 类型：Boolean | string[] | Function(app)
- 默认值：undefined

## AppRoute

微应用注册组件，包含如下 props 属性：

#### path

- 定义微应用匹配哪些路由，比如默认域名为`www.icestark.com`，`path` 设置为 `/user`，表示当访问 `www.icestark.com/user` 时，渲染此应用，必填
- 类型：`string | string[]`
- 默认值：`-`

#### url

- 微应用静态资源对应的 cdn 地址，当渲染微应用时，会将此 `url` 内的 js、css 资源加载进来，必填
- 类型：`string | string[]`
- 默认值：`-`

#### entry

- 微应用对应的 html 入口，当渲染微应用时，会通过 `window.fetch` 将 html 内容获取过来，然后 `append` 至动态创建的节点，选填。**entry > entryContent > url**
- 类型：`string`
- 默认值：`-`

#### umd

> @depreated，请使用 `loadScriptMode`。

标识微应用是否是一个标准的 UMD 微应用

- 类型：`boolean`
- 默认值：`false`

#### loadScriptMode

微应用 JavaScript 资源加载方式。当值 `fetch` 时，会通过 `window.fetch` (若AppRouter 提供了 `fetch` 参数，则会使用自定义 `fetch`) 请求资源；值为 `script`，会使用 `<script />` 标签加载资源，选填。

- 类型： `fetch | script`
- 默认值：`script`

#### entryContent

直接配置微应用的 html 内容（需要用 html 入口且不支持跨域获取资源场景）。当渲染微应用时，会 `append` 至动态创建的节点，选填。**entry > entryContent > url**

- 类型：`string`
- 默认值：`-`

#### component

当路由匹配是直接渲染 react component，渲染后会带上 `location`、`match`、`history` 的 `props`, 支持 `AppRoute` 替代 `react-route` 的基本能力。**当配置此属性时，`url` 等配置会失效**。参考 [Route.component](https://reacttraining.com/react-router/web/api/Route/component)，选填

- 类型：`string | ReactNode`
- 默认值：`-`

#### render

支持 `AppRoute` 替代 `react-route` 的基本能力。**当配置此属性时，`url` 等配置会失效**。参考 [Route.render](https://reacttraining.com/react-router/web/api/Route/render-func)，选填

- 类型：`({location, match, history}) => ReactNode`
- 默认值：`-`

#### title

微应用渲染时展示的 documentTitle ，选填

- 类型：`string`
- 默认值：`-`

#### cache

切换应用时缓存该应用资源，再次渲染时无需重复加载执行，请谨慎使用该能力，因为这会增加应用样式等冲突的概率，并可能引入内存问题。另外目前仅入口通过 url 属性配置支持该能力。

- 类型：`boolean`
- 默认值：false

#### exact

完全匹配，参考 [Route.exact](https://reacttraining.com/react-router/web/api/Route/exact-bool)，选填

- 类型：`boolean`
- 默认值：`false`

#### strict

严格匹配，参考 [Route.strict](https://reacttraining.com/react-router/web/api/Route/strict-bool)，选填

- 类型：`boolean`
- 默认值：`false`

#### sensitive

区分大小写，参考 [Route.strict](https://reacttraining.com/react-router/web/api/Route/strict-bool)，选填

- 类型：`boolean`
- 默认值：`false`

#### rootId

微应用默认加载的 DOM 节点的 id，选填

- 类型：`string`
- 默认值：`icestarkNode`

#### hashType

微应用路由以 `hash` 路由的方式接入

- 类型：`boolean`
- 默认值：`false`

#### sandbox

微应用开启沙箱运行环境

- 类型：`boolean | Sandbox`
- 默认值：`false`

`icestark` 内置 `@ice/sandbox` 作为沙箱执行依赖，开发者可以通过传入自定义的沙箱实现，作为微应用的执行沙箱：

```js
class CustomSanbox {
  constructor() {}
  // 实现在沙箱环境执行代码的方法
  execScriptInSandbox(script) {}
  // 实现清理沙箱的方法
  clear() {}
}

// 将实例化的沙箱传入 AppRoute
const sandbox = new CustomSanbox();
<AppRoute
  sanbox={sandbox}
  ...
/>
```
