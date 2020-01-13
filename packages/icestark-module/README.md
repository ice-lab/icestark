# icestark-module

> icestark-module is a JavaScript library for loading module. [icestark docs](https://ice.work/docs/icestark/about).

[![NPM version](https://img.shields.io/npm/v/@ice/stark-module.svg?style=flat)](https://npmjs.org/package/@ice/stark-module) [![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark-module.svg)](https://packagequality.com/#?package=@ice%2Fstark-module) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/stark-module.svg?style=flat)](https://npmjs.org/package/@ice/stark-module) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Installation

```bash
npm install @ice/stark-module --save
```

## API

### mount: function

mount(rootElement, entry, rootId: string = 'icestark-module')

- rootElement: string | function | HTMLElement
- entry: string | string[]
  - string with '<head>' is treated as htmlContent
  - string without '<head>' is treated as htmlUrl
  - string[] is treated as urls for js/css asserts
- rootId: string (defalut 'icestark-module')

### unmount: function

#### example

```html
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>ICE BLOCK</title>
  </head>
  <body>
    <div id="ice-module">
  </body>
</html>
```

```javascript
import { mount, unmount } from '@ice/stark-module';

// trigger mount
mount(
  'ice-module',
  'https://unpkg.com/@icedesign/ability-introduction-block@3.0.1/build/index.html',
);

// trigger unmount
unmount();
```

## Contributors

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestark/issues/new), we'd love to have your helping hand on `icestark`.

If you're interested in `icestark`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
