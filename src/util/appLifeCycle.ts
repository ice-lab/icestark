import { setCache, getCache } from './cache';
import { resetCapturedEventListeners } from './capturedListeners';

enum AppLifeCycleEnum {
  AppEnter = 'appEnter',
  AppLeave = 'appLeave',
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
