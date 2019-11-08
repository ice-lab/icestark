import '@testing-library/jest-dom/extend-expect';

import { getCache, setCache } from '../src/cache';

const nameSpace = 'ICESTARK';

describe('cache', () => {
  test('getCache', () => {
    window[nameSpace] = null;
    expect(getCache('name')).toBeNull();

    window[nameSpace] = {};
    expect(getCache('name')).toBeNull();

    window[nameSpace] = { name: 'TOM' };
    expect(getCache('name')).toBe('TOM');
  });

  test('getCache', () => {
    window[nameSpace] = null;

    setCache('testSet', {});
    expect(window[nameSpace].testSet).toStrictEqual({});
  });
});
