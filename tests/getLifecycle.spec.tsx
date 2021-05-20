import '@testing-library/jest-dom/extend-expect';

import { setCache } from '../src/util/cache';
import { getLifecyleByLibrary } from '../src/util/getLifecycle';

describe('getLifecycle', () => {
  test('getLifecyleByLibrary - string', () => {
    // @ts-ignore
    window.mockFn = {
      mount: jest.fn(),
      unmount: jest.fn(),
    }
    setCache('library', 'mockFn');

    expect(getLifecyleByLibrary()).not.toBe(null);
  })

  test('getLifecyleByLibrary - string[]', () => {
    // @ts-ignore
    (window.scope = window.scope || {}).mockFn = {
      mount: jest.fn(),
      unmount: jest.fn(),
    }
    setCache('library', ['scope', 'mockFn']);

    expect(getLifecyleByLibrary()).not.toBe(null);
  })

  test('getLifecyleByLibrary - undefined', () => {

    setCache('library', 'mockData');

    expect(getLifecyleByLibrary()).toBe(null);
  })
});


