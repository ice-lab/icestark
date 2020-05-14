import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import Sandbox, { SandboxContructor } from '@ice/sandbox';

import renderModules, {
  getModules,
  parseUrlAssets,
  appendCSS,
  clearModules,
  MicroModule,
  mountModule,
  unmoutModule,
  removeCSS,
} from '../src/modules';

const modules = [{
  name: 'selfComponent',
  url: 'http://127.0.0.1:3334/index.js',
}, {
  name: 'error',
  url: 'http://127.0.0.1:3334/error.js',
}];

declare global {
  interface Window {
    fetch?: any;
    react?: any;
    ReactDOM?: any;
  }
}

window.react = React;
window.ReactDOM = ReactDOM;

describe('render modules', () => {
  beforeEach(() => {
    const source = fs.readFileSync(path.resolve(__dirname, './component.js'));
    window.fetch = (url) => {
      return Promise.resolve({
        text: url.indexOf('error') === -1 ? () => source.toString() : () => 'const error = 1;',
      });
    };
  });

  
  test('fallback render', (next) => {
    const Component = renderModules(modules, null, {});
    const { container, unmount } = render(Component);
    expect(getModules()).toEqual(modules);
    setTimeout(() => {
      expect(container.innerHTML).toBe('<div><div><h2>404</h2></div></div>');
      unmount();
      expect(container.innerHTML).toBe('');
      next();
    }, 0);
  });

  test('render skeleton', () => {
    const { container } = render(renderModules(modules, () => {
      return (
        <div id="skeleon"></div>
      );
    }, {}));
    expect(container.innerHTML).toBe('<div id="skeleon"></div>');
  });

  test('render MicroModule with name', (next) => {
    const { container } = render(<MicroModule moduleName="selfComponent" />);
    setTimeout(() => {
      expect(container.innerHTML).toBe('<div><div><h2>404</h2></div></div>');
      next();
    }, 0);
  });

  test('render loadingComponent', (next) => {
    const { container } = render(<MicroModule moduleName="selfComponent" loadingComponent={<div>loading</div>} />);
    expect(container.innerHTML).toBe('<div>loading</div>');
    setTimeout(() => {
      expect(container.innerHTML).toBe('<div><div><h2>404</h2></div></div>');
      next();
    }, 0);
  });

  test('render MicroModule with default sandbox', (next) => {
    const { container } = render(<MicroModule moduleName="selfComponent" sandbox />);
    setTimeout(() => {
      expect(container.innerHTML).toBe('<div><div><h2>404</h2></div></div>');
      next();
    }, 0);
  }); 

  test('render MicroModule with custom className and style', (next) => {
    const { container } = render(<MicroModule moduleName="selfComponent" wrapperClassName="test" wrapperStyle={{ fontSize: '14px' }} sandbox />);
    setTimeout(() => {
      expect(container.innerHTML).toBe('<div class="test" style="font-size: 14px;"><div><h2>404</h2></div></div>');
      next();
    }, 0);
  });

  test('mountModule with default sandbox', (next) => {
    const moduleInfo = { name: 'defaultSandbox', url: '//localhost' };
    const div = document.createElement('div');
    mountModule(moduleInfo, div, {}, true);
    setTimeout(() => {
      expect(div.innerHTML).toBe('<div><h2>404</h2></div>');
      unmoutModule(moduleInfo, div);
      expect(div.innerHTML).toBe('');
      next();
    }, 0);
  });

  test('mountModule with custom sandbox', (next) => {
    const moduleInfo = { name: 'customSandbox', url: '//localhost' };
    const div = document.createElement('div');
    mountModule(moduleInfo, div, {}, (Sandbox as SandboxContructor));
    setTimeout(() => {
      expect(div.innerHTML).toBe('<div><h2>404</h2></div>');
      unmoutModule(moduleInfo, div);
      expect(div.innerHTML).toBe('');
      next();
    }, 0);
  });

  test('load error module', (next) => {
    const { container } = render(<MicroModule moduleName="error" handleError={() => {
      expect(true).toBe(true);
      next();
    }} />);
    try {
      const moduleInfo = modules.find(({ name }) => name === 'error');
      unmoutModule(moduleInfo, container);
      expect(false).toBe(true);
    } catch(error) {
      expect(true).toBe(true);
    }
  });

  test('append css', () => {
    const container = document.createElement('div');
    appendCSS('css', 'http://test.css', container);
    expect(container.innerHTML).toBe('<link module="css" rel="stylesheet" href="http://test.css">');
    removeCSS('css', container);
    expect(container.innerHTML).toBe('');
  });

  test('parse url assets', () => {
    const assets = parseUrlAssets([
      '//icestark.com/index.css',
      '//icestark.com/index.css?timeSamp=1575443657834',
      '//icestark.com/index.js',
      '//icestark.com/index.js?timeSamp=1575443657834',
    ]);
    expect(assets).toStrictEqual({
      cssList: [
        '//icestark.com/index.css',
        '//icestark.com/index.css?timeSamp=1575443657834',
      ],
      jsList: [
        '//icestark.com/index.js',
        '//icestark.com/index.js?timeSamp=1575443657834',
      ],
    });
  })

  test('clear module', () => {
    clearModules();
    expect(getModules()).toStrictEqual([]);
  });
});