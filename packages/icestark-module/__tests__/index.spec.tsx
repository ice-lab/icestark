import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import Sandbox, { SandboxConstructor } from '@ice/sandbox';

import {
  getModules,
  parseUrlAssets,
  appendCSS,
  clearModules,
  mountModule,
  unmoutModule,
  removeCSS,
  registerModule,
  registerModules,
  removeModule,
} from '../src/modules';
import MicroModule, { renderModules, renderComponent } from '../src/MicroModule';

/**
 * support react module render
 */
const defaultMount = (Component: any, targetNode: HTMLElement, props?: any) => {
  ReactDOM.render(renderComponent(Component, props), targetNode);
};

/**
 * default unmount function
 */
const defaultUnmount = (targetNode: HTMLElement) => {
  ReactDOM.unmountComponentAtNode(targetNode);
};

const defaultComponent = 'http://fixtures/01-component/index.js';
const modules = [{
  name: 'selfComponent',
  url: defaultComponent,
  mount: defaultMount,
  unmount: defaultUnmount,
}, {
  name: 'error',
  url: 'http://fixtures/01-error/index.js',
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
    window.fetch = (url: string) => {
      const prefix = 'http://fixtures/';
      if (url.startsWith(prefix)) {
        return Promise.resolve({
          text: () => fs.readFileSync(path.join(__dirname, 'fixtures', url.slice(prefix.length))),
        });
      }

      return Promise.reject('not implemented');
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
    const moduleInfo = { name: 'defaultSandbox', url: defaultComponent, mount: defaultMount, unmount: defaultUnmount };
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
    const moduleInfo = { name: 'customSandbox', url: defaultComponent, mount: defaultMount, unmount: defaultUnmount };
    const div = document.createElement('div');
    mountModule(moduleInfo, div, {}, (Sandbox as SandboxConstructor));
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
    } catch (error) {
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
  });

  describe('props rerender', () => {
    const name = 'rerender-test-module';
    beforeAll(() => {
      registerModule({
        name,
        url: 'http://fixtures/02-state/index.js',
        mount: defaultMount,
        unmount: defaultUnmount,
      });
    });

    afterAll(() => {
      removeModule(name);
    });

    test('should rerender', (next) => {
      const { container, rerender } = render(<MicroModule moduleName={name} value={5} />);

      setTimeout(() => {
        expect(container.innerHTML).toBe('<div><span>5, initial: 5</span></div>');

        rerender(<MicroModule moduleName={name} value={6} />);
        expect(container.innerHTML).toBe('<div><span>6, initial: 5</span></div>');
        next();
      }, 0);
    });
  });

  test('clear module', () => {
    clearModules();
    expect(getModules()).toStrictEqual([]);
  });
});
