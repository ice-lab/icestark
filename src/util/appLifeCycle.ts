import { setCache, getCache } from './cache';

export function triggerAppLeave() {
  const registerAppLeaveCallback = getCache('appLeave');

  if (registerAppLeaveCallback) {
    registerAppLeaveCallback();
    setCache('appLeave', null);
  }
}
