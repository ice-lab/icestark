import * as urlParse from 'url-parse';
import {
  routingEventsListeningTo,
  isInCapturedEventListeners,
  addCapturedEventListeners,
  removeCapturedEventListeners,
  callCapturedEventListeners,
  createPopStateEvent,
  setHistoryEvent,
} from './util/capturedListeners';
import { AppConfig, getMicroApps, loadMicroApp, unmountMicroApp } from './apps';
import { emptyAssets, recordAssets } from './util/handleAssets';
import { MOUNTED, UNMOUNTED } from './util/constant';
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
  onFinishLoading?:  (appConfig: AppConfig) => void;
  onError?: (err: Error) => void;
  onActiveApps: (appConfigs: AppConfig[]) => void;
}

const globalConfiguration: StartConfiguration = {
  shouldAssetsRemove: () => true,
  onRouteChange: () => {},
  onAppEnter: () => {},
  onAppLeave: () => {},
  onLoadingApp: () => {},
  onFinishLoading: () => {},
  onError: () => {},
  onActiveApps: () => {},
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

const handleStateChange = (event: PopStateEvent, url: string, method: RouteType) => {
  setHistoryEvent(event);
  routeChange(url, method);
};

const urlChange = (event: PopStateEvent | HashChangeEvent, eventType: string): void => {
  console.log('[icestark] url change', event, eventType);
  setHistoryEvent(event);
  routeChange(location.href, 'popstate');
};

let lastUrl = null;

function routeChange (url: string, type: RouteType | 'init' | 'popstate' ) {
  const { pathname, query, hash } = urlParse(url, true);
  
  lastUrl = url;
  const appsToMount = [];
  const activeApps = [];
  getMicroApps().forEach((microApp: AppConfig) => {
    const shouldBeActive = microApp.checkActive(url);
    if (shouldBeActive) {
      if (microApp.status !== MOUNTED) {
        globalConfiguration.onAppEnter(microApp);
      }
      activeApps.push(microApp);
      appsToMount.push(loadMicroApp(microApp.name));
    } else {
      if (microApp.status !== UNMOUNTED) {
        globalConfiguration.onAppLeave(microApp);
      }
      unmountMicroApp(microApp.name);
    }
  });
  // trigger onRouteChange / onActiveApps when url is changed
  if (lastUrl !== url) {
    globalConfiguration.onRouteChange(pathname, query, hash, type);
    globalConfiguration.onActiveApps(activeApps);
  }
  // call captured event after app mounted
  Promise.all(appsToMount).then(() => {
    callCapturedEventListeners();
  });
};

/**
 * Hijack window.history
 */
const hijackHistory = (): void => {
  window.history.pushState = (state: any, title: string, url?: string, ...rest) => {
    originalPush.apply(window.history, [state, title, url, ...rest]);
    const eventName = 'pushState';
    handleStateChange(createPopStateEvent(state, eventName), url, eventName);
  };

  window.history.replaceState = (state: any, title: string, url?: string, ...rest) => {
    originalReplace.apply(window.history, [state, title, url, ...rest]);
    const eventName = 'replaceState';
    handleStateChange(createPopStateEvent(state, eventName), url, eventName);
  };

  window.addEventListener('popstate', (event) => urlChange(event, 'popstate'), false);
  window.addEventListener('hashchange', (event) => urlChange(event, 'hashchange'), false);
};

/**
 * Unhijack window.history
 */
const unHijackHistory = (): void => {
  window.history.pushState = originalPush;
  window.history.replaceState = originalReplace;

  // window.removeEventListener('popstate', urlChange, false);
  // window.removeEventListener('hashchange', urlChange, false);
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
  recordAssets();
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