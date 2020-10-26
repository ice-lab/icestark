import * as fs from 'fs';
import * as path from 'path';
import { FetchMock } from 'jest-fetch-mock';
import Sandbox from '@ice/sandbox';
import { AssetTypeEnum } from '../src/util/handleAssets';
import ModuleLoader from '../src/util/umdLoader';

describe('umd loader', () => {
  const moduleLoader = new ModuleLoader();
  const umdSource = fs.readFileSync(path.resolve(__dirname, './umd-sample.js'));
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  test('load umd module', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSource.toString());
    const umdModule: any = await moduleLoader.execModule({
      jsList: [{
        content: '//icestark.com/index.js',
        type: AssetTypeEnum.EXTERNAL,
      }],
      cacheKey: 'test',
    });
    expect(!!umdModule.default).toBe(true);
  });

  test('load umd module with sandbox', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSource.toString());
    const umdModule: any = await moduleLoader.execModule({
      jsList: [{
        content: '//icestark.com/index.js',
        type: AssetTypeEnum.EXTERNAL,
      }],
      cacheKey: 'test',
    }, new Sandbox());
    expect(!!umdModule.default).toBe(true);
  });
}) 