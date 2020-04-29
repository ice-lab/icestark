import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import Sandbox, { SandboxContructor } from '@ice/sandbox';

import renderModules, { getModules, MicroModule, mountModule, unmoutModule } from '../src/modules';

const modules = [{
  name: 'selfComponent',
  url: 'http://127.0.0.1:3334/index.js',
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
    window.fetch = () => {
      return Promise.resolve({
        text: () => source.toString(),
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

  test('render MicroModule with default sanbox', (next) => {
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
});