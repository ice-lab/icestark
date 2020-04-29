# @ice/stark-module

[![NPM version](https://img.shields.io/npm/v/@ice/stark-module.svg?style=flat)](https://npmjs.org/package/@ice/stark-module) [![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstark-module.svg)](https://packagequality.com/#?package=@ice%2Fstark-module) [![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark) [![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark) [![NPM downloads](http://img.shields.io/npm/dm/@ice/stark-module.svg?style=flat)](https://npmjs.org/package/@ice/stark-module) [![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Installation

```bash
$ npm install @ice/stark-module --save
```

## Module LifeCycle

specify module lifeCycle when pack code as a micro module

```js
const SampleComponent = () => {
  return <div>Sample</div>;
}

// mount function will be trigger when mount micro module
export function mount(ModuleComponent, targetNode, props) {
  ReactDOM.render(<ModuleComponent {...props} />, targetNode);
}

// unmount function will be trigger when unmount micro module
export function unmount(targetNode) {
  ReactDOM.unmountComponentAtNode(targetNode);
}

export default SampleComponent;
```

> pack module with module spec UMD

## Usage

### Basic Usage

```jsx
import { MicroModule } from '@ice/stark-module';

const App = () => {
  const moduleInfo = {
    name: 'moduleName',
    url: 'https://localhost/module.js',
  }
  return <MicroModule moduleInfo={moduleInfo} />;
}
```

### Register Modules

```jsx
import { MicroModule, registerModules, getModules } from '@ice/stark-module';

registerModules([
  {
    url: 'https://localhost/module-a.js',
    name: 'module-a',
  },
  {
    url: 'https://localhost/module-b.js',
    name: 'module-b',
  },
]);

// get module info registered by API registerModules
const moduleInfo = getModules();

const App = () => {
  // after registerMdoules, use micro module by specify module name
  return (
    <div>
      <MicroModule moduleName="module-a" />
      <MicroModule moduleName="module-b" />
    </div>
  );
}
```

### Clear Modules

```js
import { registerModules, getModules } from '@ice/stark-module';

registerModules([
  {
    url: 'https://localhost/module-a.js',
    name: 'module-a',
  },
]);
// clear module information registered by API registerModules including content cache
clearModules();
```

### Custom Lifecyle

```jsx
import { MicroModule } from '@ice/stark-module';

const App = () => {
  const moduleInfo = {
    name: 'moduleName',
    url: 'https://localhost/module.js',
    mount: (ModuleComponent, mountNode) => {
      console.log('custom mount');
      ReactDOM.render(<ModuleComponent />, mountNode);
    },
  }
  return <MicroModule moduleInfo={moduleInfo} />;
}
```

### Custom mount component

```jsx
import { mountModule, unmoutModule } from '@ice/stark-module';

const moduleInfo = {
  name: 'moduleName',
  url: 'https://localhost/module.js',
};

const ModuleComponent = () => {
  const renderNode = useRef(null);
  useEffect(() => {
    mountModule(moduleInfo, renderNode, {});
    return unmoutModule(moduleInfo, renderNode);
  }, []);
  return (<div ref={renderNode}></div>);
};
```

## Contributors

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestark/issues/new), we'd love to have your helping hand on `icestark`.

If you're interested in `icestark`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)