let capturedPopStateListeners = [];
let historyState = null;

export function find(list, element) {
  if (!Array.isArray(list)) {
    return false;
  }

  return list.filter(item => item === element).length > 0;
}

export function createPopStateEvent(state) {
  // We need a popstate event even though the browser doesn't do one by default when you call replaceState, so that
  // all the applications can reroute.
  try {
    return new PopStateEvent('popstate', { state });
  } catch (err) {
    // IE 11 compatibility
    // https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-html5e/bd560f47-b349-4d2c-baa8-f1560fb489dd
    const evt: any = document.createEvent('PopStateEvent');
    evt.initPopStateEvent('popstate', false, false, state);
    return evt;
  }
}

export function callCapturedPopStateListeners() {
  if (capturedPopStateListeners.length && historyState) {
    capturedPopStateListeners.forEach(listener => {
      listener.call(this, createPopStateEvent(historyState));
    });
    historyState = null;
  }
}

export function setHistoryState(state) {
  historyState = state;
}

export function isInPopStateListeners(fn) {
  return find(capturedPopStateListeners, fn);
}

export function addPopStateListeners(fn) {
  capturedPopStateListeners.push(fn);
}

export function removePopStateListeners(listenerFn) {
  capturedPopStateListeners = capturedPopStateListeners.filter(fn => fn !== listenerFn);
}

export function resetPopStateListeners() {
  capturedPopStateListeners = [];
}
