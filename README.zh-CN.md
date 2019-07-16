[English](./README.md) | 简体中文

# icestark

> 大型中后台多应用共存的解决方案。

[![NPM version](https://img.shields.io/npm/v/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark.svg)](https://packagequality.com/#?package=@ice/stark) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/stark.svg?style=flat)](https://npmjs.org/package/@ice/stark) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## 安装

```bash
npm install @ice/stark --save
```

## 简介

`icestark` 是针对大型中后台多应用共存的解决方案。他可以：

- 以路由为基础，模块化方式组合多个 SPA 应用
- 多个应用间保持仓库独立，实现业务解耦、独立开发部署
- 通过公共的框架应用统一入口、页面风格
- 通过很少的改造成本，就能将已有的 react 应用迁移到 icestark 体系，完全面向 react 设计
- 保留 SPA 级用户体验

## 应用架构

使用 icestark 方案的应用架构图

![demo示例](https://img.alicdn.com/tfs/TB1PayIdqWs3KVjSZFxXXaWUXXa-806-820.jpg)

- 使用 icestark 方案的应用，会按照 UI 进行框架应用、子应用的拆分
- 框架应用：负责子应用的注册、加载，公共内容（Common Header、Common Sidebar、Common Footer 等）展示
- 子应用：负责自身业务相关的内容展示

### 兼容性

支持不同版本的 react 共存，建议使用 react 版本 15+ ，react-router 版本 4+

##

## Todos

- [ ] js、css 隔离方案优化
- [ ] 支持非 react 体系

## Contributors

欢迎反馈问题 [issue 链接](https://github.com/alibaba/ice/issues/new) 如果对 `icestark` 感兴趣，欢迎参考 [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) 学习如何贡献代码。

## License

[MIT](LICENSE)
