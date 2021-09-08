import * as fs from 'fs';
import * as path from 'path';
import { FetchMock } from 'jest-fetch-mock';
import Sandbox from '@ice/sandbox';
import { AssetTypeEnum } from '../src/util/handleAssets';
import { loadScriptByFetch } from '../src/util/loaders';
import { setCache } from '../src/util/cache';

describe('loader', () => {
  const umdSource = fs.readFileSync(path.resolve(__dirname, './umd-not-setlibrary-sample.js'));
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
    setCache('root', true);
  });

  test('load normal umd module', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSource.toString());
    const lifecycle: any = await loadScriptByFetch([{
      content: '//icestark.com/index.js',
      type: AssetTypeEnum.EXTERNAL,
    }]);

    expect(!!lifecycle.mount && !!lifecycle.unmount).toBe(true);
  });

  test('load normal umd module with sandbox', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSource.toString());
    const lifecycle: any = await loadScriptByFetch([{
      content: '//icestark.com/index.js',
      type: AssetTypeEnum.EXTERNAL,
    }], new Sandbox());

    expect(!!lifecycle.mount && !!lifecycle.unmount).toBe(true);
  });
});
