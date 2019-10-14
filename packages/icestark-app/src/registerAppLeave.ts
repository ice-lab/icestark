import { setCache } from './cache';

export default (callback?: () => void): void => {
  if (!callback) return;

  if (typeof callback !== 'function') {
    throw new Error('registerAppLeave must be function.');
  }

  setCache('appLeave', callback);
};
