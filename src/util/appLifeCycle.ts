import { setCache, getCache } from './cache';
import { resetCapturedEventListeners } from './capturedListeners';
import { exeuteUmdMount, executeUmdUnmount, executeUmdUpdate } from './handleAssets';
import getMountNode from './getMountNode';

export enum AppLifeCycleEnum {
  AppEnter = 'appEnter',
  AppLeave = 'appLeave',
}

export function cacheApp(cacheKey: string) {
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

export function deleteCache(cacheKey: string) {
  [AppLifeCycleEnum.AppEnter, AppLifeCycleEnum.AppLeave].forEach(lifeCycle => {
    setCache(`cache_${cacheKey}_${lifeCycle}`, null);
  });
}

export function isCached(cacheKey: string) {
  return !!getCache(`cache_${cacheKey}_${AppLifeCycleEnum.AppEnter}`);
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


/**
 * call umd App when app enter
 *
 * @export
 * @param {string} name
 */
export function callUmdAppEnter(name: string, rootId?: string, props?: object) {
  const container = getMountNode(rootId);
  return exeuteUmdMount(name, container, props);
}

/**
 * call umd app when app unmount
 *
 * @export
 * @param {string} name
 * @returns
 */
export function callUmdAppLeave(name: string, rootId?: string, props?: object) {
  const container = getMountNode(rootId);
  return executeUmdUnmount(name, container, props);
}


/**
 * call umd app when app update
 *
 * @export
 * @param {string} name
 * @returns
 */
export function callUmdAppUpdate(name: string, rootId?: string, props?: object) {
  const container = getMountNode(rootId);
  return executeUmdUpdate(name, container, props);
}