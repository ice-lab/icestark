import '@testing-library/jest-dom/extend-expect';

import store from '../src/store';

const namespace = 'ICESTARK';
const storeNamespace = 'store';

describe('store', () => {
  test('store.get', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    expect(store.get()).toStrictEqual({});

    store.get([]);
    expect(warnMockFn).toBeCalledWith('store.get: key should be string / symbol');

    expect(store.get('test')).toBeUndefined();
  });

  test('store.set', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    store.set([]);
    expect(warnMockFn).toBeCalledWith('store.set: key should be string / symbol / object');

    const testArray = [];
    const testObj = {};
    const testFunc = () => {};
    store.set({ name: 'TOM', age: 18, testArray, testObj, testFunc });
    expect(window[namespace][storeNamespace].store.name).toBe('TOM');
    expect(window[namespace][storeNamespace].store.age).toBe(18);
    expect(window[namespace][storeNamespace].store.testArray).toBe(testArray);
    expect(window[namespace][storeNamespace].store.testObj).toBe(testObj);
    expect(window[namespace][storeNamespace].store.testFunc).toBe(testFunc);

    store.set('name', 'LUCY');
    expect(window[namespace][storeNamespace].store.name).toBe('LUCY');
  });

  test('store.on', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    store.on([]);
    expect(warnMockFn).toBeCalledWith('store.on: key should be string / symbol');

    store.on('testOn');
    expect(warnMockFn).toBeCalledWith('store.on: callback is required, should be function');
    store.on('testOn', {});
    expect(warnMockFn).toBeCalledWith('store.on: callback is required, should be function');

    const testFunc = jest.fn();
    store.on('testOn', testFunc);
    expect(testFunc).toBeCalledTimes(0);
    expect(window[namespace][storeNamespace].storeEmitter.testOn[0]).toBe(testFunc);

    const testFuncForce = jest.fn();
    store.on('testOnForce', testFuncForce, true);
    expect(testFuncForce).toBeCalledTimes(1);
    expect(window[namespace][storeNamespace].storeEmitter.testOnForce[0]).toBe(testFuncForce);
  });

  test('store.off', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    store.off([]);
    expect(warnMockFn).toBeCalledWith('store.off: key should be string / symbol');

    store.off('testOff');
    expect(warnMockFn).toBeCalledWith('store.off: testOff has no callback');

    const testFunc = jest.fn();
    window[namespace][storeNamespace].storeEmitter.testOff = [testFunc];
    store.off('testOff');
    expect(window[namespace][storeNamespace].storeEmitter.testOff).toBeUndefined();

    window[namespace][storeNamespace].storeEmitter.testOff = [testFunc];
    store.off('testOff', testFunc);
    expect(window[namespace][storeNamespace].storeEmitter.testOff).toStrictEqual([]);
  });
});
