import { setCache } from './cache';

export interface LifecycleProps {
  container: HTMLElement | string;
  customProps?: object;
}

export default (callback?: (props: LifecycleProps) => void): void => {
  if (!callback) return;

  if (typeof callback !== 'function') {
    throw new Error('registerAppEnter must be function.');
  }

  setCache('appEnter', callback);
};
