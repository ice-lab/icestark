import '@testing-library/jest-dom/extend-expect';
import * as reactDom from 'react-dom';
import * as React from 'react';
import * as fs from 'fs';
import * as path from 'path';

import renderModules from '../src/index';

const modules = [{
  name: 'selfComponent',
  url: 'http://127.0.0.1:3334/index.js',
}];

declare global {
  interface Window {
    fetch?: any;
    react?: any;
    ReactDom?: any;
  }
}

window.react = React;
window.ReactDom = reactDom;

describe('render modules', () => {
  beforeEach(() => {
    const source = fs.readFileSync(path.resolve(__dirname, './component.js'));
    window.fetch = () => {
      return Promise.resolve({
        text: () => source.toString(),
      });
    };
  });

  
  test('modules', (next) => {
    const div = document.createElement('div');
    const Component = renderModules(modules, null, {});
    reactDom.render(Component, div);
    setTimeout(() => {
      // expect(div.children[0].children[0].id).toBe('selfComponent');
      expect(div.innerHTML).toBe('<div><div><h2>404</h2></div></div>');
      next();
    }, 1000);
    // expect(component.children).toBeNull();
  });
});