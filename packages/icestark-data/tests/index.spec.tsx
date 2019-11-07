import '@testing-library/jest-dom/extend-expect';

import { store, event } from '../src/index';
import { isArray, isObject, warn } from '../src/utils';

describe('store', () => {
  test('store', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    store.set([]);
    expect(warnMockFn).toBeCalledWith('store.set: key should be string / object');

    store.set({ a: 1, b: 2 });
    expect(store.get('a')).toBe(1);
    expect(store.get('b')).toBe(2);

    store.set('user', { name: 'Tom', age: 11 });
    const userInfo = store.get('user');
    expect(userInfo.name).toBe('Tom');
    expect(userInfo.age).toBe(11);

    const changeLang = jest.fn();
    store.on('language', changeLang, true);
    expect(changeLang).toBeCalledWith(undefined);
    store.set('language', 'CH');
    expect(changeLang).toBeCalledWith('CH');
  });
});
