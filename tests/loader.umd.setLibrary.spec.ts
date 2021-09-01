import * as fs from 'fs';
import * as path from 'path';
import { FetchMock } from 'jest-fetch-mock';
import Sandbox from '@ice/sandbox';
import { AssetTypeEnum } from '../src/util/handleAssets';
import { loadBundle } from '../src/util/loaders';
import { setCache } from '../src/util/cache';

describe('loader', () => {
  const umdSourceWithSetLibrary = fs.readFileSync(path.resolve(__dirname, './umd-setlibrary-sample.js'));
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
    setCache('root', true);
  });

  test('load umd module - setLibraryName', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const lifecycle: any = await loadBundle([{
      content: '//icestark.com/index.js',
      type: AssetTypeEnum.EXTERNAL,
    }]);
    expect(!!lifecycle.mount && !!lifecycle.unmount).toBe(true);
  });

  test('load umd module with sandbox - setLibraryName', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const lifecycle: any = await loadBundle([{
      content: '//icestark.com/index.js',
      type: AssetTypeEnum.EXTERNAL,
    }], new Sandbox());
    expect(!!lifecycle.mount && !!lifecycle.unmount).toBe(true);
  });
});
