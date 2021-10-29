import { setCache } from './cache';
import type { LifecycleProps } from './registerAppEnter';

export default (callback?: (props: LifecycleProps) => void): void => {
  if (!callback) return;

  if (typeof callback !== 'function') {
    throw new Error('registerAppLeave must be function.');
  }

  setCache('appLeave', callback);
};
