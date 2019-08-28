import { getIcestark } from './common';

/**
 * CustomEvent Polyfill for IE
 */
(function() {
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
export default () => {
  if (getIcestark('root')) {
    window.dispatchEvent(new CustomEvent('icestark:not-found'));

    // Compatible processing return renderNotFound();
    return null;
  }

  return 'Current sub-application is running independently';
};
