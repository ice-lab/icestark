# 快速起步

## 介绍

[icestark](https://github.com/ice-lab/icestark) 是一个面向大型系统的微前端解决方案，适用于以下业务场景：

- 后台比较分散，体验差别大，因为要频繁跳转导致操作效率低，希望能统一收口的一个系统内
- 单页面应用非常庞大，多人协作成本高，开发/构建时间长，依赖升级回归成本高
- 系统有二方/三方接入的需求

icestark 在保证一个系统的操作体验基础上，实现各个微应用的独立开发和发版，主应用通过 icestark 管理微应用的注册和渲染，将整个系统彻底解耦。

## 项目初始化

icestark 可以通过简单的命令行，生成主应用和微应用模板。无论您是使用 React 还是 Vue，都可以便捷的创建符合 icestark 微前端规范的项目。这些项目均由 icestark 团队官方维护。

:::tip
如果您想将正在开发中或已开发完成的项目接入 icestark，请移步[主应用接入](./guide/use-layout/react)和[微应用接入](./guide/use-child/react)。如果您使用的是 [create-react-app](https://github.com/facebook/create-react-app) 、umi 等框架开发的应用，亦可参考[其它框架的接入指南](./guide/use-child/others)。
:::

### 初始化主应用

```bash
# 基于 React 的主应用
$ npm init ice icestark-layout @icedesign/stark-layout-scaffold
# 或者基于 Vue 的主应用
$ npm init ice icestark-layout @vue-materials/icestark-layout-app

$ cd icestark-layout
$ npm install
$ npm start
```

### 初始化微应用

```bash
# 基于 React 的微应用
$ npm init ice icestark-child @icedesign/stark-child-scaffold
# 基于 Vue 的微应用
$ npm init ice icestark-child @vue-materials/icestark-child-app

$ cd icestark-child
$ npm install
$ npm run start
```

## 兼容性

+ 现代浏览器和 IE11。

:::tip
对于 IE 系列浏览器，需要提供相应的 polyfill 支持。详细介绍，请参考[常见问题 -> 兼容 IE 浏览器](./faq#兼容-ie-浏览器)
:::
