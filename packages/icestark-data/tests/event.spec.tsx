import '@testing-library/jest-dom/extend-expect';

import event from '../src/event';

const namespace = 'ICESTARK';
const eventNamespace = 'event';

describe('event', () => {
  test('event.on', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    event.on([]);
    expect(warnMockFn).toBeCalledWith('event.on: key should be string');

    event.on('testOn');
    expect(warnMockFn).toBeCalledWith('event.on: callback is required, should be function');
    event.on('testOn', {});
    expect(warnMockFn).toBeCalledWith('event.on: callback is required, should be function');

    const testFunc = jest.fn();
    event.on('testOn', testFunc);
    expect(testFunc).toBeCalledTimes(0);
    expect(window[namespace][eventNamespace].eventEmitter.testOn[0]).toBe(testFunc);
  });

  test('event.off', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    event.off([]);
    expect(warnMockFn).toBeCalledWith('event.off: key should be string');

    event.off('testOff');
    expect(warnMockFn).toBeCalledWith('event.off: testOff has no callback');

    const testFunc = jest.fn();
    window[namespace][eventNamespace].eventEmitter.testOff = [testFunc];
    event.off('testOff');
    expect(window[namespace][eventNamespace].eventEmitter.testOff).toBeUndefined();

    window[namespace][eventNamespace].eventEmitter.testOff = [testFunc];
    event.off('testOff', testFunc);
    expect(window[namespace][eventNamespace].eventEmitter.testOff).toStrictEqual([]);
  });

  test('event.emit', () => {
    const warnMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
    };

    const testFunc = jest.fn();
    const testFunc2 = jest.fn();
    window[namespace][eventNamespace].eventEmitter.testEmit = [testFunc, testFunc2];

    event.emit('testEmit', 'testData');
    expect(testFunc).toBeCalledWith('testData');
    expect(testFunc2).toBeCalledWith('testData');

    event.emit('testEmit', 'testData2');
    expect(testFunc).toBeCalledWith('testData2');
    expect(testFunc2).toBeCalledWith('testData2');

    window[namespace][eventNamespace].eventEmitter.testEmit = [];
    event.emit('testEmit', 'testData2');
    expect(warnMockFn).toBeCalledWith('event.emit: no callback is called for testEmit');

    window[namespace][eventNamespace].eventEmitter.testEmit = undefined;
    event.emit('testEmit', 'testData2');
    expect(warnMockFn).toBeCalledWith('event.emit: no callback is called for testEmit');
  });

  test('event.has', () => {
    window[namespace][eventNamespace].eventEmitter.testHas = undefined;
    expect(event.has('testHas')).toBe(false);

    const testFunc = jest.fn();
    const testFunc2 = jest.fn();
    window[namespace][eventNamespace].eventEmitter.testHas = [testFunc, testFunc2];
    expect(event.has('testHas')).toBe(true);
  });
});
