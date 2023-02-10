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
 * Trigger customEvent icestark:not-found
 */
export default (error) => {
  if (getCache('root')) {
    window.dispatchEvent(new CustomEvent('icestark:error', error));

    // Compatible processing return renderNotFound();
    return null;
  }

  return 'Current sub-application is running independently';
};
