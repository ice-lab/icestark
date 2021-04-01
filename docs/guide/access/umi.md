# umi 应用改造为 icestark 微应用

> 基于 umi 3.x

改造步骤如下：

#### 安装 icestark 依赖


```shell
$ npm i @ice/stark-app --save
```


#### `src` 目录下添加 `app.tsx` 文件


在 `app.tsx` 修改子应用渲染的节点，并注册子应用生命周期。


```js
//src/app.tsx
import ReactDOM from 'react-dom';
import { isInIcestark, getMountNode, registerAppEnter, registerAppLeave } from '@ice/stark-app';

// 在 icestark 中修改渲染的节点
export function modifyClientRenderOpts(memo: any) {
  return {
    ...memo,
    rootElement: isInIcestark() ? getMountNode() : memo.rootElement
  };
}

// 为 icestark 注册生命周期
export function render (oldRender: any) {
  if (isInIcestark()) {
    registerAppEnter(() => {
      oldRender();
    });
    registerAppLeave(() => {
      ReactDOM.unmountComponentAtNode(getMountNode());
    });
  } else {
    oldRender();
  }
}
```


#### 匹配页面路由


经过上面的步骤，umi 子应用已能够正常加载。但需要正确渲染，还需要匹配当前渲染路由。比如，在子应用渲染在 `https://localhost:3333/seller` 路由下，则需要修改 umi 子应用 `.umirc.ts`，通过 `base` 属性添加路由前缀。


```js
import { defineConfig } from 'umi';

export default defineConfig({
  // 由于 umi 不支持动态修改路由前缀，因此无法使用 icestark 提供的 getBasename 方法
  // 可以通过 umi 自定义插件的能力更改 https://umijs.org/zh-CN/plugins/api#modifyroutes
  base: '/seller/',
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
});
```

