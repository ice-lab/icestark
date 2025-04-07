import * as fs from 'fs';
import * as path from 'path';
import { FetchMock } from 'jest-fetch-mock';
import { AssetTypeEnum } from '../src/util/handleAssets';
import { loadScriptByFetch } from '../src/util/loaders';
import { setCache } from '../src/util/cache';

describe('loader', () => {
  const reactUMD = fs.readFileSync(path.resolve(__dirname, './global-umd-sample.js'));
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
    setCache('root', true);
  });

  test('load js bundle with runtime', async () => {
    (fetch as FetchMock).mockResponseOnce(reactUMD.toString());
    window['React@16.14.0'] = {};
    await loadScriptByFetch([{
      content: '//icesk.com/index.js',
      type: AssetTypeEnum.RUNTIME,
      library: 'React',
      version: '16.14.0',
    }]);
    expect(window['React@16.14.0']?.version).toBe('16.14.0');
  });
});
