import { getCache } from './cache';

/**
 * Trigger customEvent icestark:not-found
 */
export default (error) => {
  if (getCache('root')) {
    window.dispatchEvent(new CustomEvent('icestark:error', { bubbles: false, cancelable: false, detail: error }));
    // Compatible processing return renderError();
    return null;
  }

  return 'Current sub-application is running independently';
};
