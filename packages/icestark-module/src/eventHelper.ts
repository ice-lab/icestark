/**
 * CustomEvent Polyfill for IE.
 * See https://gist.github.com/gt3/787767e8cbf0451716a189cdcb2a0d08.
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


export function dispatchEvent (mark: string, params: Record<'detail', object>) {
  return window.dispatchEvent(new CustomEvent(mark, params));
}

export function resolveEvent (mark: string) {
  return new Promise((resolve) => window.addEventListener(mark, resolve));
}
