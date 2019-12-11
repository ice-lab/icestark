import '@testing-library/jest-dom/extend-expect';

import { setCache, getCache } from '../src/util/cache';

describe('setCache', () => {
  test('setCache', () => {
    expect(setCache('testKey', 123)).toBeUndefined;

    setCache('testKey', 123);
    expect(getCache('testKey')).toBe(123);
  });
});
