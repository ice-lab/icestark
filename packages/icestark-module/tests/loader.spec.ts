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
  beforeEach(() => {
    // mock fetch
    const source = fs.readFileSync(path.resolve(__dirname, './component.js'));
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

  test('execute module', async () => {
    const moduleInfo = await moduleLoader.execModule({ name: 'modulename', url: '//source' });
    expect(!!moduleInfo.default).toBe(true);
  });

  test('excute module in sandbox', async () => {
    const sandbox = new Sandbox({ multiMode: true });
    const moduleInfo = await moduleLoader.execModule({ name: 'modulename', url: '//source' }, sandbox);
    expect(!!moduleInfo.default).toBe(true);
  });
});