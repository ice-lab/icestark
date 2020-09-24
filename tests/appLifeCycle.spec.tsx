import '@testing-library/jest-dom/extend-expect';

import { AppLifeCycleEnum, cacheApp, callAppEnter, callAppLeave, isCached, deleteCache } from '../src/util/appLifeCycle';
import { setCache } from '../src/util/cache';

describe('appLifeCycle', () => {
  test('callAppEnter', () => {
    const appEnterMockFn = jest.fn();

    setCache(AppLifeCycleEnum.AppEnter, appEnterMockFn);

    callAppEnter();
    expect(appEnterMockFn).toBeCalledTimes(1);

    setCache(AppLifeCycleEnum.AppEnter, null);
    callAppEnter();
    expect(appEnterMockFn).toBeCalledTimes(1);
  });

  test('callAppLeave', () => {
    const appLeaveMockFn = jest.fn();

    setCache(AppLifeCycleEnum.AppLeave, appLeaveMockFn);

    callAppLeave();
    expect(appLeaveMockFn).toBeCalledTimes(1);

    setCache(AppLifeCycleEnum.AppLeave, null);
    callAppLeave();
    expect(appLeaveMockFn).toBeCalledTimes(1);
  });

  test('cache app', () => {
    const appEnterMockFn = jest.fn();
    const appLeaveMockFn = jest.fn();
    const appKey = 'appKey';
    setCache(AppLifeCycleEnum.AppEnter, appEnterMockFn);
    setCache(AppLifeCycleEnum.AppLeave, appLeaveMockFn);
    cacheApp(appKey);
    expect(isCached(appKey)).toBe(true);
    deleteCache(appKey);
    expect(isCached(appKey)).toBe(false);
  })
});
