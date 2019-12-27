//  Reference https://github.com/CanopyTax/single-spa/blob/master/src/navigation/navigation-events.js
export enum CapturedEventNameEnum {
  POPSTATE = 'popstate',
  HASHCHANGE = 'hashchange',
}

export const routingEventsListeningTo = [
  CapturedEventNameEnum.HASHCHANGE,
  CapturedEventNameEnum.POPSTATE,
];

const capturedEventListeners = {
  [CapturedEventNameEnum.POPSTATE]: [],
  [CapturedEventNameEnum.HASHCHANGE]: [],
};

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

export function callCapturedEventListeners() {
  if (historyState) {
    Object.keys(capturedEventListeners).forEach(eventName => {
      const capturedListeners = capturedEventListeners[eventName];
      if (capturedListeners.length) {
        capturedListeners.forEach(listener => {
          listener.call(this, createPopStateEvent(historyState));
        });
      }
    });
    historyState = null;
  }
}

export function setHistoryState(state) {
  historyState = state;
}

export function isInCapturedEventListeners(eventName, fn) {
  return find(capturedEventListeners[eventName], fn);
}

export function addCapturedEventListeners(eventName, fn) {
  capturedEventListeners[eventName].push(fn);
}

export function removeCapturedEventListeners(eventName, listenerFn) {
  capturedEventListeners[eventName] = capturedEventListeners[eventName].filter(
    fn => fn !== listenerFn,
  );
}

export function resetCapturedEventListeners() {
  capturedEventListeners[CapturedEventNameEnum.POPSTATE] = [];
  capturedEventListeners[CapturedEventNameEnum.HASHCHANGE] = [];
}
