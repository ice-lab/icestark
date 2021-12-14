import '@testing-library/jest-dom/extend-expect';

import { warn, error } from '../src/util/message';

describe('message', () => {
  test('warn', () => {
    const warnMockFn = jest.fn();
    const errorMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
      error: errorMockFn,
    };

    const warnStr = 'this is warn test';
    warn(warnStr);
    expect(warnMockFn).toBeCalledTimes(1);
    expect(warnMockFn).toBeCalledWith(warnStr);

    expect(errorMockFn).toBeCalledTimes(0);
  });

  test('error', () => {
    const warnMockFn = jest.fn();
    const errorMockFn = jest.fn();
    (global as any).console = {
      warn: warnMockFn,
      error: errorMockFn,
    };

    const errorStr = 'this is warn test';
    error(errorStr);
    expect(errorMockFn).toBeCalledTimes(1);
    expect(errorMockFn).toBeCalledWith(errorStr);

    expect(warnMockFn).toBeCalledTimes(0);
  });
});
