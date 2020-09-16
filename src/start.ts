import * as urlParse from 'url-parse';
import {
  routingEventsListeningTo,
  isInCapturedEventListeners,
  addCapturedEventListeners,
  removeCapturedEventListeners,
  callCapturedEventListeners,
  setHistoryState,
} from './util/capturedListeners';
import { AppConfig, getMicroApps, loadMicroApp, unmountMicroApp } from './microApps';
import { emptyAssets } from './util/handleAssets';
// import { setCache } from './util/cache';
export interface StartConfiguration {
  shouldAssetsRemove?: (
    assetUrl?: string,
    element?: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement,
  ) => boolean;
  onRouteChange?: (
    pathname: string,
    query: object,
    hash?: string,
    type?: RouteType | 'init' | 'popstate',
  ) => void;
  onAppEnter?: (appConfig: AppConfig) => void;
  onAppLeave?: (appConfig: AppConfig) => void;
  onLoadingApp?: (appConfig: AppConfig) => void;
  onError?: (err: Error) => void;
  onNotFound?: () => void;
}

const globalConfiguration: StartConfiguration = {
  shouldAssetsRemove: () => true,
  onRouteChange: () => {},
  onAppEnter: () => {},
  onAppLeave: () => {},
  onLoadingApp: () => {},
  onError: () => {},
  onNotFound: () => {},
};

interface OriginalStateFunction {
  (state: any, title: string, url?: string): void;
}

type RouteType = 'pushState' | 'replaceState';

let started = false;
const originalPush: OriginalStateFunction = window.history.pushState;
const originalReplace: OriginalStateFunction = window.history.replaceState;
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

const handleStateChange = (state: any, url: string, method: RouteType) => {
  setHistoryState(state);
  routeChange(url, method);
};

const handlePopState = (event: PopStateEvent): void => {
  setHistoryState(event.state);
  console.log('event.state', event);
  routeChange(location.href, 'popstate');
};

function routeChange (url: string, type: RouteType | 'init' | 'popstate' ) {
  const { pathname, query, hash } = urlParse(url, true);
  globalConfiguration.onRouteChange(pathname, query, hash, type);
  const appsToMount = [];
  getMicroApps().forEach((microApp: AppConfig) => {
    if (microApp.activeRuleFunction(url)) {
      appsToMount.push(loadMicroApp(microApp.name));
    } else {
      unmountMicroApp(microApp.name);
    }
  });
  Promise.all(appsToMount).then(() => {
    console.log('callCapturedEventListeners');
    callCapturedEventListeners();
  });
};

/**
 * Hijack window.history
 */
const hijackHistory = (): void => {
  window.history.pushState = (state: any, title: string, url?: string, ...rest) => {
    console.log(state);
    originalPush.apply(window.history, [state, title, url, ...rest]);
    handleStateChange(state, url, 'pushState');
  };

  window.history.replaceState = (state: any, title: string, url?: string, ...rest) => {
    originalReplace.apply(window.history, [state, title, url, ...rest]);
    handleStateChange(state, url, 'replaceState');
  };

  window.addEventListener('popstate', handlePopState, false);
};

/**
 * Unhijack window.history
 */
const unHijackHistory = (): void => {
  window.history.pushState = originalPush;
  window.history.replaceState = originalReplace;

  window.removeEventListener('popstate', handlePopState, false);
};

/**
 * Hijack eventListener
 */
const hijackEventListener = (): void => {
  window.addEventListener = (eventName, fn, ...rest) => {
    if (
      typeof fn === 'function' &&
      routingEventsListeningTo.indexOf(eventName) >= 0 &&
      !isInCapturedEventListeners(eventName, fn)
    ) {
      addCapturedEventListeners(eventName, fn);
      return;
    }

    return originalAddEventListener.apply(window, [eventName, fn, ...rest]);
  };

  window.removeEventListener = (eventName, listenerFn, ...rest) => {
    if (typeof listenerFn === 'function' && routingEventsListeningTo.indexOf(eventName) >= 0) {
      removeCapturedEventListeners(eventName, listenerFn);
      return;
    }

    return originalRemoveEventListener.apply(window, [eventName, listenerFn, ...rest]);
  };
};

/**
 * Unhijack eventListener
 */
const unHijackEventListener = (): void => {
  window.addEventListener = originalAddEventListener;
  window.removeEventListener = originalRemoveEventListener;
};


function start(options?: StartConfiguration) {
  if (started) {
    console.log('icestark has been already started');
    return;
  }
  started = true;
  // update globalConfiguration
  Object.keys(options || {}).forEach((configKey) => {
    globalConfiguration[configKey] = options[configKey];
  });
  hijackHistory();
  hijackEventListener();

  // trigger init router
  routeChange(location.href, 'init');
}

function unload() {
  unHijackEventListener();
  unHijackHistory();

  // remove all assets added by micro apps
  emptyAssets(globalConfiguration.shouldAssetsRemove, true);
}

export { unload, globalConfiguration };
export default start;