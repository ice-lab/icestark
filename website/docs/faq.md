---
toc: menu
---
# 常见问题

## 微应用 bundle 加载失败？

前端应用如果做了按需加载，按需加载的 bundle 默认是根据当前域名拼接地址，如果前端资源部署在非当前域名（比如 CDN）下，则需要通过手动配置 publicPath 来实现，[ice](https://ice.work/docs/guide/about) 用户可参考[文档](https://ice.work/docs/guide/basic/build#publicPath)；其他用户可以参考 [wepback publicPath](https://webpack.js.org/guides/public-path/#root)。

## 微应用开发时请求本地 Mock 接口？

通常情况下，代码中的接口请求地址都是写成类似 `/api/xxx` 的相对地址，请求时会根据当前域名进行拼接，如果微应用嵌入主应用进行开发，在域名变化后依旧想使用微应用的 Mock 接口或者代理配置，可以设置 `baseURL` 来请求非当前域名的接口地址，比如 `axios` 可以通过 `axios.defaults.baseURL` 来实现：

```js
// src/utils/request.js
import axios from 'axios';

axios.defaults.baseURL = '//127.0.0.1:4444';
```

如果微应用使用 icejs 研发框架提供的数据请求方案，则只需通过配置 `appConfig`：

```js
import { runApp } from 'ice';

const appConfig = {
  ...
  request: {
    baseURL: '//127.0.0.1:4444',
  }
};

runApp(appConfig);
```

由于开发调试过程中主应用和微应用的域名或者端口不一致，非 icejs 研发框架的工程可能会有跨域问题，需要修改 webpack devServer 配置：

```js
module.exports = {
  devServer: {
    before(app) {
      app.use((req, res, next) => {
        // set cors for all served files
        res.set('Access-Control-Allow-Origin', '*');
        next();
      });
    },
  }
};
```

## 微应用本地开发如何调试？

单独微应用开发时只能看到自身的内容，无法关注到在主应用下的表现，这时候本地如果需要再启动一个主应用，开发起来就很繁琐。针对这种情况，我们推荐通过主应用的日常/线上环境调试本地微应用。

在主应用中注册微应用时，如果 url 里携带了类似 `?__env__=local` 的 query，则将微应用的 url 转换为对应的本地服务地址，这样就可以方便调试微应用了。大体代码如下（可根据具体需求调整）：

```js
// src/app.jsx
import React from 'react';
import { AppRouter, AppRoute } from '@ice/stark';
import urlParse from 'url-parse';
import BasicLayout from '@/layouts/BasicLayout';

const urlQuery = urlParse(location.href, true).query || {};

function getBundleUrl(name, version) {
  let jsUrl = `//g.alicdn.com/${name}/${version}/index.min.js`;
  let cssUrl = `//g.alicdn.com/${name}/${version}/index.min.css`;

  if (urlQuery.env === 'local') {
    jsUrl = `//127.0.0.1:${urlQuery.port}/build/js/index.js`;
    cssUrl = `//127.0.0.1:${urlQuery.port}/build/css/index.css`;
  }
  return [cssUrl, jsUrl];
}

const apps = [{
  title: '通用页面',
  url: getBundleUrl('seller', '0.1.0'),
  // ...
}]
```

:::tip
如果微应用是开启按需加载，为了让微应用资源能够正确加载，需要微应用开启本地服务的时候设置 <code>publicPath</code>，如果微应用基于 icejs 进行开发，可以参考<a href="https://ice.work/docs/guide/basic/build#devPublicPath">配置</a>。
:::

## 应用启用 lazy 后，chunk 加载失败

多个微应用均开启 lazy 加载页面，建议通过开启 sandbox 隔离微应用 windows 全局变量。如果无法开启 sandbox，则需要在主应用 `onAppLeave` 的阶段清空 webpackJsonp 配置：

```js
const onAppLeave = (appConfig) => {
  window.webpackJsonp = [];
};
```

主应用和微应用均开启 lazy 的情况下，需要通过配置 `webpack.output.jsonpFunction` 来隔离两个应用的全局变量名称，详见 [webpack 配置](https://webpack.js.org/configuration/output/#outputjsonpfunction)。

## `Error: Invariant failed: You should not use <withRouter(Navigation) /> outside a <Router>`

因为 jsx 嵌套层级的关系，在主应用的 Layout 里没法使用 react-router 提供的 API，比如 `withRouter`, `Link`, `useParams` 等，具体参考文档 [主应用中路由跳转](/docs/guide/use-layout/react#主应用中路由跳转)。

## 官方 Demo 如何启用 HashRouter

官方推荐 BrowserRouter 作为微前端的路由模式。在某些情况下，你可以通过以下方式适配 HashRouter 路由模式。

#### 修改主应用的路由模式

在 `src/app.ts` 中增加以下配置，将 `router` 修改为 `hash`。

```diff
import { runApp } from 'ice';

const appConfig = {
  router: {
-   type: 'browser',
+   type: 'hash',
  }
};

runApp(appConfig);
```

#### 为微应用设置 hashType 为 true

```diff
import { runApp } from 'ice';

const appConfig: IAppConfig = {
  icestark: {
    type: 'framework',
    Layout: FrameworkLayout,
    getApps: async () => {
      const apps = [{
        path: '/seller',
        title: '商家平台',
        sandbox: true,
+       hashType: true,
        url: [
          '//dev.g.alicdn.com/nazha/ice-child-react/0.0.1/js/index.js',
          '//dev.g.alicdn.com/nazha/ice-child-react/0.0.1/css/index.css',
        ],
      }, {
        path: '/waiter',
        title: '小二平台',
        sandbox: true,
+       hashType: true,
        url: [
          '//ice.alicdn.com/icestark/child-waiter-vue/app.js',
          '//ice.alicdn.com/icestark/child-waiter-vue/app.css',
        ],
      }];
      return apps;
    },
  },
};

runApp(appConfig);
```

#### 修改 FrameworkLayout 中的逻辑

此外，你可能需要自行修改 `FrameworkLayout` 中的逻辑，路由信息会通过 `routeInfo` 字段返回。

```js
import * as React from 'react';
import BasicLayout from '../BasicLayout';
import UserLayout from '../UserLayout';

interface RouteInfo {
  hash: string;
  pathname: string;
  query: object;
  routeType: 'pushState' | 'replaceState',
}

const { useEffect } = React;
export default function FrameworkLayout(props: {
  children: React.ReactNode;
  appLeave: { path: string };
  appEnter: { path: string };
  routeInfo: RouteInfo;
}) {
  const { children, appLeave, appEnter, routeInfo } = props;
  // 如果是 HashRouter 模式
  const isHashRouter = true;
  const { hash = '', pathname } = routeInfo;
  const path = isHashRouter ? hash.replace('#', '') : pathname;
  const Layout = hash === '/login' ? UserLayout : BasicLayout;

  useEffect(() => {
    console.log('== app leave ==', appLeave);
    if (appLeave.path === '/angular' && window.webpackJsonp) {
      // remove webpackJsonp added by Angular app
      delete window.webpackJsonp;
    }
  }, [appLeave]);

  useEffect(() => {
    console.log('== app enter ==', appEnter);
  }, [appEnter]);

  return (
    <Layout pathname={path}>{children}</Layout>
  );
}
```

#### 微应用改造

微应用的同样需要改造成 `HashRouter` 路由模式。

#### 应用间跳转

应用间跳转可以通过 `AppLink` 和 `appHistory`，并设置 `hashType` 为 `true`。

```js
import { AppLink, appHistory } from '@ice/stark-app';

// 示例1
const navItem = <AppLink to="/seller" hashType>{item.name}</AppLink>);

// 示例2
appHistory.push('/seller', true);
```

## 兼容 IE 浏览器

要使得 icestark 可以在 IE 浏览器环境下正常运行，强烈建议完成以下 2 个步骤：

1. 使用 [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env) 为 IE 浏览器添加 `Symbol`、`Promise` 等不兼容的高级语法特性

```js
// .babelrc 或 babel-loader 配置
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry",
        "targets": {
          "ie": "11"
        },
        "modules": false,
        "corejs": 3
      }
    ]
  ]
}
```

[ice 工程体系](https://ice.work/docs/guide/about)中，已自动添加环境所依赖的 polyfill。请参考 [ice 工程构建配置](https://ice.work/docs/guide/basic/build#polyfill)。

2. 添加 `fetch` polyfill

当 [`loadScriptMode`](/docs/api/wrapper#loadscriptmode) 为 `fetch` 时，icestark 会使用 `window.fetch` 获取微应用静态资源，因此还需要对 `fetch` 进行 polyfill。这里，我们推荐 [whatwg-fetch](https://github.com/github/fetch)。请确保在 icestark 之前引入该资源。

```js
// 入口文件
import "whatwg-fetch"; // 确保在 icestark 之前引入

import { AppRouter, AppRoute } from '@ice/stark';

console.log(window.fetch);
```

## IE 浏览器环境下支持沙箱吗

**不支持**。在不支持 `Proxy` 语法的浏览器环境（比如 IE 浏览器），icestark 会有如下提示：

```text
proxy sandbox is not support by current browser
```

并回退到无沙箱模式执行。

:::tip
此外，我们并不推荐添加诸如 <a href="https://github.com/GoogleChrome/proxy-polyfill">proxy-polyfill</a> 等 polyfill 方法来支持 icestark 沙箱。因为目前实现 Proxy 的 polyfill 都不是完备的（有缺陷的），icestark 沙箱在实现上使用了 <code>has</code> trap，而这个 trap 目前无法在 polyfill 中实现。更多有关 Proxy 的内容，可参考 <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy">Proxy</a>。
:::

## Script Error 的解决方法

“ Script error. ” 是一个常见错误，但由于该错误不提供完整的报错信息（错误堆栈），问题排查往往无从下手。icestark 的 [scriptAttributes](/docs/api/core#scriptattributes) 参数支持为加载的 `<script />` 资源添加 `crossorigin="anonymous"` 来解决这个问题。具体可参考 [scriptAttributes](/docs/api/core#scriptattributes)。

:::tip
想了解更多有关 Script Error 的问题，可以参考 <a href="https://help.aliyun.com/document_detail/88579.html">“Script error.”的产生原因和解决办法</a>
:::
