import { getCache } from './cache';

/**
 * CustomEvent Polyfill for IE
 */
(function () {
  if (typeof (window as any).CustomEvent === 'function') return false;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  (window as any).CustomEvent = CustomEvent;
})();

/**
 * Trigger customEvent icestark:error
 */
export default (error) => {
  if (getCache('root')) {
    window.dispatchEvent(new CustomEvent('icestark:error', { bubbles: false, cancelable: false, detail: error }));
    // Compatible processing return renderError();
    return null;
  }

  return 'Current sub-application is running independently';
};

/**
 * Trigger customEvent icestark:not-found
 */
export const renderNotFound = () => {
  if (getCache('root')) {
    window.dispatchEvent(new CustomEvent('icestark:not-found'));

    // Compatible processing return renderNotFound();
    return null;
  }

  return 'Current sub-application is running independently';
};
