# 性能优化

## prefetch

通过预加载子应用资源，可以提升 **非首屏首次加载子应用** 的渲染速度。简单用法如下：

```js
import { registerMicroApps, start } from '@ice/stark';

registerMicroApps([
  {
    name: 'waiter',
   	path: '/waiter',
    title: '商家平台',
    sandbox: true,
    url: [
      'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-seller-react/build/js/index.js',
      'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-seller-react/build/css/index.css',
    ],
  },
  {
    name: 'seller',
   	path: '/seller',
    title: '小二平台',
    sandbox: true,
    url: [
      'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-waiter-vue/dist/js/app.js',
      'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-waiter-vue/dist/css/app.css',
    ],
  }
], {
	afterMount: () => { console.log('mounted') },
});

start({
	prefetch: true,
})
```

`prefetch` 值支持三种形式：

+ **布尔值**：当 `prefetch` 为 `true` 时，所以微应用资源均会被 `prefetch`;
+ **数组**：当传入值为 `name` 的数组时，只要数组中的微应用资源会被 `prefetch`;

```js
start({
	prefetch: ['waiter'], // 只有 `name` 为 waiter 的微应用会被 prefetch
})
```

+ **函数**：当传入为函数时，`prefetch` 加载的能力需要自己处理。

```js
start({
	prefetch: (app) => app.name === 'waiter',
})
```

当您使用的 `AppRouter` 接入 icestark 时，也是相同的使用方式：

```js
// src/App.jsx
import React from 'react';
import { AppRouter, AppRoute } from '@ice/stark';
import BasicLayout from '@/layouts/BasicLayout';

const App = () => {
  render() {
    return (
      <BasicLayout>
        <AppRouter
          prefetch
          // or prefetch={['waiter']}
          // or prefetch={(app) => app.name === 'waiter'}
          >
          <AppRoute
            name="waiter"
            path="/waiter"
            title="商家平台"
            url={[
              'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-waiter-vue/dist/js/app.js',
              'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-waiter-vue/dist/css/app.css',
            ]}
          />
          ...
        </AppRouter>
      </BasicLayout>
    );
  }
}
```

还可以通过 `prefetchApps` 手动控制需要被 `prefetch` 的应用。

```js
// 在某个比较前的时机
prefetchApps([{
	name: 'waiter',
  url: [
    'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-waiter-vue/dist/js/app.js',
    'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-waiter-vue/dist/css/app.css',
  ]
}]);
```

:::tip
有关 <code>prefetch</code> 的更多讨论或反馈，请移步 <a href="https://github.com/ice-lab/icestark/issues/188">RFC-prefetch</a>
:::


## 页面懒加载

现代框架大多支持 webpack [Dynamic Imports](https://webpack.js.org/guides/code-splitting/#dynamic-imports)，简单来说，就是只有访问某页面时，页面的脚本和样式资源才会加载。比如在 React 中的用法：

```js
import React from 'react';
import { Switch, Route } from 'react-router-dom';

function App () {
  return (
    <Switch>
      <Route path="/a" component={React.lazy(() => import('./A'))} ></Route>
      <Route path="/b" component={React.lazy(() => import('./B'))} ></Route>
      ...
    </Switch>
  >
}
```

> 更多介绍可参考 [React.lazy](https://reactjs.org/docs/code-splitting.html#reactlazy)

在 Vue 中的用法可参考 [Lazy Loading Routes](https://router.vuejs.org/guide/advanced/lazy-loading.html#grouping-components-in-the-same-chunk)：

```js
const router = new Router({
  routes: [
    {
      path: '/seller',
      name: 'seller',
      component: () => () => import(/* webpackChunkName: "group-foo" */ './Seller.vue')
    }
  ]
})
```

Dynamic Imports 可以大幅减少主 bunlde 的代码体积，从而提升微应用加载速度。另外，在 icestark 微应用中引入 Dynamic Imports 需要注意以下两点：

1. 配置微应用的 [publicPath](https://webpack.js.org/configuration/output/#outputpublicpath)

为了避免 webpack 在微应用运行过程中访问错误的静态地址，因此最好设置静态资源的绝对访问路径。比如，静态资源打包发送到 CDN 服务上，则配置：

```js
// webpack.config.js

{
  ...
  output: {
    publicPath: 'https://www.cdn.example/'
  }
}
```

若静态资源存放在服务器，则配置：

```js
{
  ...
  output: {
    publicPath: 'https://www.seller.com/'
  }
}
```

2. 如果框架应用同样配置了 Dynamic Imports，配置 [shouldAssetsRemove](http://localhost:3000/docs/api/ice-stark#shouldassetsremove)

icestark 内部会在微应用卸载时，同时卸载微应用的样式资源，防止样式污染。因此，如若框架应用配置了 Dynamic Imports，可以通过 [shouldAssetsRemove](http://localhost:3000/docs/api/ice-stark#shouldassetsremove) 防止错误地移除框架应用的样式资源。

```js
// src/App.jsx
import { AppRouter, AppRoute } from '@ice/stark';

const App = () => {
  render() {
    return (
      <AppRouter
        shouldAssetsRemove={(url, element) => {
          // 如果请求主应用静态资源，返回 false
          if (url.includes('www.framework.com')) {
            return false;
          }
          return true;
        }}
        >
        ...
      </AppRouter>
    );
  }
}
```

## cached

icestark 提供微应用切换时缓存的能力。在开启该字段后，icestark 不会清理上个微应用的静态资源，不再重复执行脚本资源，以加快微应用二次加载的执行速度。若需要开启该能力，需配置：

```js
// src/App.jsx
import { AppRouter, AppRoute } from '@ice/stark';

const App = () => {
  render() {
    return (
      <AppRouter>
        <AppRoute
          name="waiter"
          path="/waiter"
          title="商家平台",
          cached
          url={[
            'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-waiter-vue/dist/js/app.js',
            'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-waiter-vue/dist/css/app.css',
          ]}
        />
        ...
      </AppRouter>
    );
  }
}
```

当需要使用 `cached` 能力时，保证已了解该能力带来的副作用：

1. 由于微应用在切换时不会卸载样式资源，可能会导致样式污染

一般来说，微应用之间的样式通过 [CSS Modules](https://github.com/css-modules/css-modules) 不会造成样式的大量污染，需要警惕的是三方组件库（比如 AntD、Fusion）产生的污染，尤其当某一微应用全局修改了组件库的样式。

2. 在开启沙箱能力时，可能会导致内存泄露问题






