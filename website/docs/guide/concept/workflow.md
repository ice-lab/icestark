---
order: 3
---

# 工作流程

## 图示

<p style={{ textAlign: 'center' }} >
  <img width="80%" src="https://img.alicdn.com/imgextra/i2/O1CN01TLS76R1hwE2F8KPCe_!!6000000004341-2-tps-3576-2664.png" alt="icestark 加载图示" />
</p>


## 加载模式

icestark 目前支持三种加载模式，分别是 `script`、`fetch` 和 `import`，由 [loadScriptMode](/docs/api/ice-stark#loadscriptmode) 字段指定。

1. `script`

默认加载方式。该模式下，icestark 会通过 HTML `<script />` 标签加载微应用脚本资源，再次加载时充分利用浏览器缓存进行加载。

2. `fetch`

当指定 `loadScriptMode` 为 `fetch`，或配置微应用[沙箱模式](/docs/api/ice-stark#sandbox)时，会通过 `window.fetch` 或[用户自定义的 fetch 能力](/docs/api/ice-stark#fetch) 加载并缓存脚本资源。再次加载时，会充分利用本地内部缓存进行加载。

3. `import`

加载 [ES modules](/docs/guide/use-child/others#vite-应用) 类型微应用的主要方式，该模式会通过 [Dynamic Import](https://github.com/tc39/proposal-dynamic-import) 动态加载脚本资源。

## 钩子函数

icestark 在加载微应用的各个阶段提供钩子函数，方便用户监听并执行相应逻辑。详细用法可参考 [StartConfiguration](/docs/api/ice-stark#startconfiguration)

| 钩子函数      | 触发时机 | 用法示例 |
| ----------- | ----------- | ----------- |
| `onActiveApps`      | 微应用开始被激活的回调  | 记录当前 url 匹配的微应用 |
| `onLoadingApp`   | 微应用加载前的回调        | 在微应用加载过程中渲染加载动画 |
| `onFinishLoading`   | 微应用加载并执行后的回调        | 在微应用加载过程中结束渲染加载动画、结合 `onLoadingApp` 记录微应用加载执行的时长 |
| `onAppEnter`   | 微应用开始渲染前的回调        |  结合 `onLoadingApp` 记录微应用从加载到渲染的时长，结合 `onFinishLoading` 记录微应用渲染耗时  |
| `onAppLeave`   | 微应用卸载前的回调        |  记录用户的停留时长 |
| `onError`   | 微应用在 icestark 在加载或执行错的回调  |  记录微应用运行的错误信息 |

