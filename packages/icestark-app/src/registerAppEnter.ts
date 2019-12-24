import { setCache } from './cache';

export default (callback?: () => void): void => {
  if (!callback) return;

  if (typeof callback !== 'function') {
    throw new Error('registerAppEnter must be function.');
  }

  setCache('appEnter', callback);
};
