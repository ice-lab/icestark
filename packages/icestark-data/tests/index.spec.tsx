import '@testing-library/jest-dom/extend-expect';

import { store, event } from '../src/index';

describe('store', () => {
  test('store', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    store.set('user', { name: 'Tom', age: 11 });
    const userInfo = store.get('user');
    expect(userInfo.name).toBe('Tom');
    expect(userInfo.age).toBe(11);

    expect(store.has('language')).toBe(false);

    const changeLang = jest.fn();
    store.on('language', changeLang, true);
    expect(changeLang).toBeCalledWith(undefined);

    store.set('language', 'CH');
    expect(changeLang).toBeCalledWith('CH');
    store.set('language', 'EN');
    expect(changeLang).toBeCalledWith('EN');
    expect(changeLang).toBeCalledTimes(3);

    expect(store.has('language')).toBe(true);

    store.off('language', changeLang);
    expect(changeLang).toBeCalledTimes(3);
    expect(store.has('language')).toBe(false);

    store.on('language', changeLang);
    const changeLang2 = jest.fn();
    store.on('language', changeLang2, true);
    expect(changeLang2).toBeCalledTimes(1);
    expect(store.has('language')).toBe(true);
  });
});

describe('event', () => {
  test('event', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    const testFunc = jest.fn();
    const testFunc2 = jest.fn();

    expect(event.has('testEvent')).toBe(false);

    event.on('testEvent', testFunc);
    expect(event.has('testEvent')).toBe(true);

    event.emit('testEvent', 'testData');
    expect(testFunc).toBeCalledWith('testData');

    event.on('testEvent', testFunc2);
    expect(event.has('testEvent')).toBe(true);

    event.emit('testEvent', 'testData');
    expect(testFunc).toBeCalledWith('testData');
    expect(testFunc).toBeCalledTimes(2);
    expect(testFunc2).toBeCalledWith('testData');

    event.off('testEvent', testFunc);
    expect(event.has('testEvent')).toBe(true);

    event.emit('testEvent', 'testData');
    expect(testFunc).toBeCalledTimes(2);
    expect(testFunc2).toBeCalledWith('testData');
    expect(testFunc2).toBeCalledTimes(2);

    event.off('testEvent', testFunc2);
    expect(event.has('testEvent')).toBe(false);
  });
});
