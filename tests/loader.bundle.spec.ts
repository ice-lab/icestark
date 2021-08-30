import * as fs from 'fs';
import * as path from 'path';
import { FetchMock } from 'jest-fetch-mock';
import Sandbox from '@ice/sandbox';
import { AssetTypeEnum } from '../src/util/handleAssets';
import { loadBundle } from '../src/util/loaders';
import { setCache } from '../src/util/cache';

describe('loader', () => {
  const jsBundleSource = fs.readFileSync(path.resolve(__dirname, './js-bundle-sample.js'));
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
    setCache('root', true);
  });

  test('load js bundle', async () => {
    (fetch as FetchMock).mockResponseOnce(jsBundleSource.toString());
    const lifecycle: any = await loadBundle([{
      content: '//icesk.com/index.js',
      type: AssetTypeEnum.EXTERNAL,
    }]);
    expect((!!lifecycle.mount && !!lifecycle.unmount)).toBe(true);
  });

  test('load js bundle with sandbox', async () => {
    (fetch as FetchMock).mockResponseOnce(jsBundleSource.toString());
    const lifecycle: any = await loadBundle([{
      content: '//icesk.com/index.js',
      type: AssetTypeEnum.EXTERNAL,
    }], new Sandbox());
    expect((!!lifecycle.mount && !!lifecycle.unmount)).toBe(true);
  });
});
