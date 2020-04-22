import * as fs from 'fs';
import * as path from 'path';
import Sandbox from '@ice/sandbox';
import ModuleLoader from '../src/loader';

declare global {
  interface Window {
    fetch?: any;
  }
}

describe('module loader', () => {
  const source = fs.readFileSync(path.resolve(__dirname, './component.js'));
  beforeEach(() => {
    // mock fetch
    window.fetch = (url) => {
      const isSource = url.indexOf('source') > 0;
      return Promise.resolve({
        text: () => isSource ? source.toString() : url,
      });
    };
  });
  const moduleLoader = new ModuleLoader();

  test('load module', () => {
    const task = moduleLoader.load({
      url: '//localhost',
      name: 'test',
    });
    task.then((text) => {
      expect(text).toEqual('//localhost');
    });
  });

  test('load cache', () => {
    const task = moduleLoader.load({ name: 'test', url: '//localhost2' });
    task.then((text) => {
      expect(text).toEqual('//localhost');
    });
  });

  test('load source', () => {
    const task = moduleLoader.load({ name: 'testsource', url: '//source' });
    task.then((text) => {
      expect(text).toEqual(source.toString());
    });
  });
});