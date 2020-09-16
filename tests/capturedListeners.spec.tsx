import '@testing-library/jest-dom/extend-expect';

import {
  CapturedEventNameEnum,
  find,
  addCapturedEventListeners,
  removeCapturedEventListeners,
  isInCapturedEventListeners,
  callCapturedEventListeners,
  setHistoryEvent,
  createPopStateEvent,
  resetCapturedEventListeners,
} from '../src/util/capturedListeners';

describe('capturedListeners', () => {
  test('find', () => {
    const testMockFn = jest.fn();

    expect(find({}, 1)).toBe(false);

    expect(find([], 1)).toBe(false);

    expect(find([testMockFn], () => {})).toBe(false);

    expect(find([testMockFn], testMockFn)).toBe(true);
  });

  test('capturedListeners', () => {
    const popStateMockFn = jest.fn();
    const hashChangeMockFn = jest.fn();

    // add
    addCapturedEventListeners(CapturedEventNameEnum.POPSTATE, popStateMockFn);
    addCapturedEventListeners(CapturedEventNameEnum.HASHCHANGE, hashChangeMockFn);

    expect(isInCapturedEventListeners(CapturedEventNameEnum.HASHCHANGE, hashChangeMockFn)).toBe(
      true,
    );
    expect(isInCapturedEventListeners(CapturedEventNameEnum.POPSTATE, popStateMockFn)).toBe(true);

    // call
    setHistoryEvent(createPopStateEvent({}, 'popstate'));
    callCapturedEventListeners();

    expect(popStateMockFn).toBeCalledTimes(1);
    expect(hashChangeMockFn).toBeCalledTimes(1);

    // remove
    removeCapturedEventListeners(CapturedEventNameEnum.HASHCHANGE, hashChangeMockFn);

    expect(isInCapturedEventListeners(CapturedEventNameEnum.HASHCHANGE, hashChangeMockFn)).toBe(
      false,
    );

    // call
    setHistoryEvent(createPopStateEvent({}, 'popstate'));
    callCapturedEventListeners();

    expect(popStateMockFn).toBeCalledTimes(2);
    expect(hashChangeMockFn).toBeCalledTimes(1);

    // reset
    resetCapturedEventListeners();

    // call
    setHistoryEvent(createPopStateEvent({}, 'popstate'));
    callCapturedEventListeners();

    expect(popStateMockFn).toBeCalledTimes(2);
    expect(hashChangeMockFn).toBeCalledTimes(1);
  });
});
