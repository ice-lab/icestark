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

export default class App extends React.Component {
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

在 Vue 中的用法





