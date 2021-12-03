# 性能优化

## prefetch

通过预加载子应用资源，可以提升 **非首屏首次加载子应用** 的渲染速度。简单用法如下：

```js
import { registerMicroApps, start } from '@ice/stark';

registerMicroApps([
  {
    name: 'waiter',
   	activePath: '/waiter',
    title: '商家平台',
    sandbox: true,
    url: [
      'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-seller-react/build/js/index.js',
      'https://iceworks.oss-cn-hangzhou.aliyuncs.com/icestark/child-seller-react/build/css/index.css',
    ],
  },
  {
    name: 'seller',
   	activePath: '/seller',
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
  return (
    <BasicLayout>
      <AppRouter
        prefetch
        // or prefetch={['waiter']}
        // or prefetch={(app) => app.name === 'waiter'}
        >
        <AppRoute
          name="waiter"
          activePath="/waiter"
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

## cached

icestark 提供微应用切换时缓存的能力。在开启该字段后，icestark 不会清理上个微应用的静态资源，不再重复执行脚本资源，以加快微应用二次加载的执行速度。若需要开启该能力，需配置：

```js
// src/App.jsx
import { AppRouter, AppRoute } from '@ice/stark';

const App = () => {
  return (
    <AppRouter>
      <AppRoute
        name="waiter"
        activePath="/waiter"
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
```

当需要使用 `cached` 能力时，保证已了解该能力带来的副作用：

1. 由于微应用在切换时不会卸载样式资源，可能会导致样式污染

一般来说，微应用之间的样式通过 [CSS Modules](https://github.com/css-modules/css-modules) 不会造成样式的大量污染，需要警惕的是三方组件库（比如 AntD、Fusion）产生的污染，尤其当某一微应用全局修改了组件库的样式。

2. 在开启沙箱能力时，可能会导致内存泄露问题

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
module.exports = {
  ...
  output: {
    publicPath: 'https://www.cdn.example/'
  }
}
```

若静态资源存放在服务器，则配置：

```js
// webpack.config.js
module.exports = {
  ...
  output: {
    publicPath: 'https://www.seller.com/'
  }
}
```

2. 如果主应用同样配置了 Dynamic Imports，配置 [shouldAssetsRemove](/docs/api/ice-stark#shouldassetsremove)

icestark 内部会在微应用卸载时，同时卸载微应用的样式资源，防止样式污染。因此，如若主应用配置了 Dynamic Imports，可以通过 [shouldAssetsRemove](/docs/api/ice-stark#shouldassetsremove) 防止错误地移除主应用的样式资源。

```js
// src/App.jsx
import { AppRouter, AppRoute } from '@ice/stark';

const App = () => {
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
```

:::tip
我们强烈建议使用 `shouldAssetsRemove` 只针对主应用的资源进行相关的配置（微应用的静态资源可交由 icestark 进行加载与卸载）。
:::

## 依赖外置

通常主应用和微应用会共有一些基础依赖，比如 `React`、`ReactDOM`、组件库等。可以适当考虑微应用外置掉这些基础依赖，由主应用统一加载。比如，通过 [webpack Externals](https://webpack.js.org/configuration/externals) 外置微应用的基础依赖：

```js
// webpack.config.js
mmodule.exports = {
  // ...
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'antd': 'antd'
  },
};
```

并在主应用的 `index.html` 中加载基础依赖的 cdn 版本。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge,chrome=1" />
    <meta name="viewport" content="width=device-width" />
    <title>icestark Framework App</title>
  </head>

  <body>
    <div id="root"></div>
    <!-- 在主应用中加载基础依赖 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/17.0.0/cjs/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.0/cjs/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/antd/4.17.0-alpha.8/antd.min.js"></script>

    <!-- 加载主应用的脚本资源 -->
    <script src="//ice.alicdn.com/icestark/layout-app/build/js/index.js"></script>
  </body>
</html>
```

## LoadingComponent

微应用之间切换造成的空白画面让人难以接受，为了降低页面空白造成的视觉冲击，可以在微应用的切换时添加一个 “过渡” 动画：

```js
import Loading from './Loading';

const App = () => {
  return (
    <AppRouter
      LoadingComponent={Loading}
      >
      ...
    </AppRouter>
  );
}
```

