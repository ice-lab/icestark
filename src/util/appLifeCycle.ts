import { setCache, getCache } from './cache';
import { resetCapturedEventListeners } from './capturedListeners';

enum AppLifeCycleEnum {
  AppEnter = 'appEnter',
  AppLeave = 'appLeave',
}

export function cacheApp(cacheKey, cacheContent) {
  setCache(`cache_${cacheKey}_content`, cacheContent);
  [AppLifeCycleEnum.AppEnter, AppLifeCycleEnum.AppLeave].forEach(lifeCycle => {
    const lifeCycleCacheKey = `cache_${cacheKey}_${lifeCycle}`;
    if (getCache(lifeCycle)) {
      setCache(lifeCycleCacheKey, getCache(lifeCycle));
    } else if (getCache(lifeCycleCacheKey)) {
      // set cache to current lifeCycle
      setCache(lifeCycle, getCache(lifeCycleCacheKey));
    }
  });
}

export function deleteCache(cacheKey) {
  setCache(`cache_${cacheKey}_content`, null);
  [AppLifeCycleEnum.AppEnter, AppLifeCycleEnum.AppLeave].forEach(lifeCycle => {
    setCache(`cache_${cacheKey}_${lifeCycle}`, null);
  });
}

export function isCached(cacheKey, content) {
  return !!getCache(`cache_${cacheKey}_${AppLifeCycleEnum.AppEnter}`) && getCache(`cache_${cacheKey}_content`) === content;
}

export function callAppEnter() {
  const appEnterKey = AppLifeCycleEnum.AppEnter;
  const registerAppEnterCallback = getCache(appEnterKey);

  if (registerAppEnterCallback) {
    registerAppEnterCallback();
    setCache(appEnterKey, null);
  }
}

export function callAppLeave() {
  // resetCapturedEventListeners when app change, remove react-router/vue-router listeners
  resetCapturedEventListeners();

  const appLeaveKey = AppLifeCycleEnum.AppLeave;
  const registerAppLeaveCallback = getCache(appLeaveKey);

  if (registerAppLeaveCallback) {
    registerAppLeaveCallback();
    setCache(appLeaveKey, null);
  }
}
