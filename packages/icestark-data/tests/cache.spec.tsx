import '@testing-library/jest-dom/extend-expect';

import { getCache, setCache } from '../src/cache';

const namespace = 'ICESTARK';

describe('cache', () => {
  test('getCache', () => {
    window[namespace] = null;
    expect(getCache('name')).toBeNull();

    window[namespace] = {};
    expect(getCache('name')).toBeNull();

    window[namespace] = { name: 'TOM' };
    expect(getCache('name')).toBe('TOM');
  });

  test('getCache', () => {
    window[namespace] = null;

    setCache('testSet', {});
    expect(window[namespace].testSet).toStrictEqual({});
  });
});
