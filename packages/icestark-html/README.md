# icestark-html

> icestark loadHtml solution. [icestark docs](https://ice.work/docs/icestark/about).

[![NPM version](https://img.shields.io/npm/v/@ice/stark-html.svg?style=flat)](https://npmjs.org/package/@ice/stark-html) [![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark-html.svg)](https://packagequality.com/#?package=@ice%2Fstark-html) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/stark-html.svg?style=flat)](https://npmjs.org/package/@ice/stark-html) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Installation

```bash
npm install @ice/stark-html --save
```

#### example

```javascript
import loadHtml from '@ice/stark-html';

const div = document.createElement('div');
const htmlUrl = '//icestark.com';

loadHtml(div, htmlUrl)
  .then(() => {
    // success callback
  })
  .catch(() => {
    // error callback
  });
```

## Contributors

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestark/issues/new), we'd love to have your helping hand on `icestark`.

If you're interested in `icestark`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
