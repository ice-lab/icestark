import * as fs from 'fs';
import * as path from 'path';
import { FetchMock } from 'jest-fetch-mock';
import Sandbox from '@ice/sandbox';
import { AssetTypeEnum, appendAssets } from '../src/util/handleAssets';
import { setCache, getCache } from '../src/util/cache';
import { AppLifeCycleEnum } from '../src/util/appLifeCycle';

describe('getLifecycles', () => {
  const umdSource = fs.readFileSync(path.resolve(__dirname, './umd-not-setlibrary-sample.js'));
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

  test('get app lifecycles - umd', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSource.toString());
    await appendAssets(assets, 'test', true);

    const enter = getCache(AppLifeCycleEnum.AppEnter)
    const leave = getCache(AppLifeCycleEnum.AppLeave)
    expect(!!enter && !!leave).toBe(true);
  });

  test('get app lifecycles - umd with sandbox', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSource.toString());

    await appendAssets(assets, 'test', true, new Sandbox());

    const enter = getCache(AppLifeCycleEnum.AppEnter)
    const leave = getCache(AppLifeCycleEnum.AppLeave)
    expect(!!enter && !!leave).toBe(true);
  });

  test('get app lifecycles - umd with loadScriptMode', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSource.toString());

    await appendAssets(assets, 'test', true, new Sandbox(), 'fetch');

    const enter = getCache(AppLifeCycleEnum.AppEnter)
    const leave = getCache(AppLifeCycleEnum.AppLeave)
    expect(!!enter && !!leave).toBe(true);
  });
});
