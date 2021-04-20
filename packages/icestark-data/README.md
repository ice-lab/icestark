# icestark-data

> icestark sommunication solution. [icestark docs](https://ice-lab.github.io/icestark/).

[![NPM version](https://img.shields.io/npm/v/@ice/stark-data.svg?style=flat)](https://npmjs.org/package/@ice/stark-data) [![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark-data.svg)](https://packagequality.com/#?package=@ice%2Fstark-data) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/stark-data.svg?style=flat)](https://npmjs.org/package/@ice/stark-data) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Installation

```bash
npm install @ice/stark-data --save
```

## API

### Store

Global Store, unified management of all variables

- get(key)
- set(key, value)
- on(key, callback, force), when `force` is true, callback will be called immediately when initializing
- off(key, callback)

#### example

```javascript
// Framework
import { store } from '@ice/stark-data';

const userInfo = { name: 'Tom', age: 18 };
store.set('user', userInfo); // set UserInfo
store.set('language', 'CH');

// Sub-application A
import { store } from '@ice/stark-data';

const userInfo = store.get('user'); // get UserInfo

function showLang(lang) {
  console.log(`current language is ${lang}`);
}

store.on('language', showLang, true); // add callback for 'language', callback will be called whenever 'language' is changed

store.off('language', showLang); // remove callback for 'language'
```


### Event

Global Event, unified management of all events

- on(key, callback)  `callback` will be called with (...rest)
- off(key, callback)
- emit(key, ...rest)

#### example

```javascript
// Framework
import { event } from '@ice/stark-data';

function fresh(needFresh) {
  if (!needFresh) return;

  fetch('/api/fresh/message').then(res => {
    // ...
  });
}

event.on('freshMessage', fresh);

// Sub-application A
import { event } from '@ice/stark-data';

event.emit('freshMessage', false);
// ...
event.emit('freshMessage', true);
```

## Contributors

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestark/issues/new), we'd love to have your helping hand on `icestark`.

If you're interested in `icestark`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
