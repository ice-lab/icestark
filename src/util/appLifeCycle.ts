import { setCache, getCache } from './cache';
import { resetPopStateListeners } from './capturedListeners';

export function callAppEnter() {
  const registerAppEnterCallback = getCache('appEnter');

  if (registerAppEnterCallback) {
    registerAppEnterCallback();
    setCache('appLeave', null);
  }
}

export function callAppLeave() {
  // resetPopStateListeners when app change, remove react-router/vue-router listeners
  resetPopStateListeners();

  const registerAppLeaveCallback = getCache('appLeave');

  if (registerAppLeaveCallback) {
    registerAppLeaveCallback();
    setCache('appLeave', null);
  }
}
