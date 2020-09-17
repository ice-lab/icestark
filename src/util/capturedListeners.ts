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

let historyEvent = null;

export function find(list, element) {
  if (!Array.isArray(list)) {
    return false;
  }

  return list.filter(item => item === element).length > 0;
}

// inspired by https://github.com/single-spa/single-spa/blob/master/src/navigation/navigation-events.js#L107
export function createPopStateEvent(state, originalMethodName) {
  // We need a popstate event even though the browser doesn't do one by default when you call replaceState, so that
  // all the applications can reroute.
  let evt;
  try {
    evt =  new PopStateEvent('popstate', { state });
  } catch (err) {
    // IE 11 compatibility
    // https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-html5e/bd560f47-b349-4d2c-baa8-f1560fb489dd
    evt = document.createEvent('PopStateEvent');
    evt.initPopStateEvent('popstate', false, false, state);
  }
  evt.icestark = true;
  evt.icestarkTrigger = originalMethodName;
  return evt;
}

export function callCapturedEventListeners() {
  if (historyEvent) {
    Object.keys(capturedEventListeners).forEach(eventName => {
      const capturedListeners = capturedEventListeners[eventName];
      if (capturedListeners.length) {
        capturedListeners.forEach(listener => {
          listener.call(this, historyEvent);
        });
      }
    });
    historyEvent = null;
  }
}

export function setHistoryEvent(evt: PopStateEvent) {
  historyEvent = evt;
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
