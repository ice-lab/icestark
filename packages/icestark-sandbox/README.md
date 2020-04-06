# @ice/sandbox

> icestark sandbox solution. [icestark docs](https://ice.work/docs/icestark/about).

[![NPM version](https://img.shields.io/npm/v/@ice/sandbox.svg?style=flat)](https://npmjs.org/package/@ice/sandbox) [![Package Quality](https://npm.packagequality.com/shield/@ice%2Fsandbox.svg)](https://packagequality.com/#?package=@ice%2Fsandbox) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/sandbox.svg?style=flat)](https://npmjs.org/package/@ice/sandbox) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Installation

```bash
npm install @ice/sandbox --save
```

## Usage

### Basic

`@ice/sandbox` is built-in solution for icestark

```jsx
<AppRoute
  sandbox
  path="/seller"
  title="商家平台"
  url={[
    '//unpkg.com/icestark-child-seller/build/js/index.js',
    '//unpkg.com/icestark-child-seller/build/css/index.css',
  ]}
/>
```

### Custom sanbox

custom sanbox for app by pass sandbox as follow defination.

```jsx
class CustomSanbox {
  constructor() {}
  // execute scripts in custom sandbox
  execScriptInSandbox(script) {}
  // clear side effects added by sandbox
  clear() {}
}

// pass custom sandbox to AppRoute
const sandbox = new CustomSanbox();
<AppRoute
  sanbox={sandbox}
  ...
/>
```

## Inspiration

`@ice/sandbox` is inspired by [tc39/proposal-realms](https://github.com/tc39/proposal-realms), [realms-shim](https://github.com/Agoric/realms-shim) and [qiankun sanbox](https://github.com/umijs/qiankun).

## Contributors

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestark/issues/new), we'd love to have your helping hand on `icestark`.

If you're interested in `icestark`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
