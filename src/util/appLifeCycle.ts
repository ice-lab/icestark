import { setCache, getCache } from './cache';
import { resetPopStateListeners } from './capturedListeners';

export async function callAppEnter() {
  const registerAppEnterCallback = getCache('appEnter');

  if (registerAppEnterCallback) {
    await registerAppEnterCallback();
    setCache('appLeave', null);
  }
}

export async function callAppLeave() {
  // resetPopStateListeners when app change, remove react-router/vue-router listeners
  resetPopStateListeners();

  const registerAppLeaveCallback = getCache('appLeave');

  if (registerAppLeaveCallback) {
    registerAppLeaveCallback();
    setCache('appLeave', null);
  }
}
