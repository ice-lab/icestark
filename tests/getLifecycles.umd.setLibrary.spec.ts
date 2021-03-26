import * as fs from 'fs';
import * as path from 'path';
import { FetchMock } from 'jest-fetch-mock';
import Sandbox from '@ice/sandbox';
import { AssetTypeEnum, appendAssets } from '../src/util/handleAssets';
import { setCache, getCache } from '../src/util/cache';
import { AppLifeCycleEnum } from '../src/util/appLifeCycle';

describe('getLifecycles', () => {
  const umdSourceWithSetLibrary = fs.readFileSync(path.resolve(__dirname, './umd-setlibrary-sample.js'));
  const assets = {
    jsList: [{
      content: '//icestark.com/index.js',
      type: AssetTypeEnum.EXTERNAL,
    }],
    cssList: [],
  }
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
    setCache(AppLifeCycleEnum.AppEnter, null);
    setCache(AppLifeCycleEnum.AppLeave, null);
  });

  test('get app lifecycles - setLibrary with sandbox', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    await appendAssets(assets, 'test', undefined, new Sandbox());

    const enter = getCache(AppLifeCycleEnum.AppEnter)
    const leave = getCache(AppLifeCycleEnum.AppLeave)
    expect(!!enter && !!leave).toBe(true);
  });

  test('get app lifecycles - setLibrary with umd', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    await appendAssets(assets, 'test', true);

    const enter = getCache(AppLifeCycleEnum.AppEnter)
    const leave = getCache(AppLifeCycleEnum.AppLeave)
    expect(!!enter && !!leave).toBe(true);
  });
});
