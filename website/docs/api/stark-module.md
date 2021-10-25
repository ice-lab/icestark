---
toc: menu
---

# @ice/stark-module

以下 api 均从 `@ice/stark-module` 导出。使用方式如下：

```js
import { MicroModule, registerModule } from '@ice/stark-module';
```

## ModuleInfo

`ModuleInfo` 是一个类型接口，用于定义一个微模块结构。接口定义如下：

```ts
name: string;
url: string | string[];
render?: (props: StarkModule) => any;
runtime?: Runtime;
mount?: (Component: any, targetNode: HTMLElement, props?: any) => void;
unmount?: (targetNode: HTMLElement) => void;
```

各字段介绍如下：

### name

微模块唯一标识（必填）。

- 类型： `string`
- 默认值：`-`

### url

微模块静态资源对应的 CDN 地址，当渲染微模块时，会主动加载该资源（必填）。

- 类型：`string | string[]`
- 默认值：`-`


### render

用于渲染一个本地模块（选填），参考 [注册本地模块](/docs/guide/micro-module#注册本地模块)。


### runtime

用于加载公共依赖库（选填），参考 [性能优化](/docs/guide/micro-module#性能优化)。

### mount

用于自定义生命周期（选填），参考 [自定义生命周期](/docs/guide/micro-module#自定义生命周期)。

### unmount

用于自定义生命周期（选填），参考 [自定义生命周期](/docs/guide/micro-module#自定义生命周期)。

## MicroModule

封装底层能力的 React Component，用于 React 框架模块快速接入。

```js
import { MicroModule } from '@ice/stark-module';

const App = () => {
  const moduleInfo = {
    name: 'moduleName',
    url: 'https://localhost/module.js',
  }
  return <MicroModule moduleInfo={moduleInfo} />;
}
```

## registerModule

注册单个模块。

```js
registerModule({
  url: 'https://localhost/module-a.js',
  name: 'module-a',
});
```

## registerModules

同时注册多个模块。

```js
registerModules([
  {
    url: 'https://localhost/module-b.js',
    name: 'module-b',
  },
  {
    url: 'https://localhost/module-c.js',
    name: 'module-c',
  },
]);
```

## clearModules

移除已注册的所有模块。

```js
import { registerModules, clearModules } from '@ice/stark-module';

registerModules([
  {
    url: 'https://localhost/module-a.js',
    name: 'module-a',
  },
  {
    url: 'https://localhost/module-b.js',
    name: 'module-b',
  },
]);

clearModules();
```