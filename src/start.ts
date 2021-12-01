import urlParse from 'url-parse';
import {
  routingEventsListeningTo,
  isInCapturedEventListeners,
  addCapturedEventListeners,
  removeCapturedEventListeners,
  callCapturedEventListeners,
  createPopStateEvent,
  setHistoryEvent,
} from './util/capturedListeners';
import { AppConfig, getMicroApps, createMicroApp, unmountMicroApp, clearMicroApps } from './apps';
import { emptyAssets, recordAssets } from './util/handleAssets';
import { LOADING_ASSETS, MOUNTED } from './util/constant';
import { doPrefetch } from './util/prefetch';
import globalConfiguration, { temporaryState } from './util/globalConfiguration';
import type { RouteType, StartConfiguration } from './util/globalConfiguration';

if (!window?.fetch) {
  throw new Error('[icestark] window.fetch not found, you need polyfill it');
}

interface OriginalStateFunction {
  (state: any, title: string, url?: string): void;
}

let started = false;
const originalPush: OriginalStateFunction = window.history.pushState;
const originalReplace: OriginalStateFunction = window.history.replaceState;
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

const handleStateChange = (event: PopStateEvent, url: string, method: RouteType) => {
  setHistoryEvent(event);
  globalConfiguration.reroute(url, method);
};

const urlChange = (event: PopStateEvent | HashChangeEvent): void => {
  setHistoryEvent(event);
  globalConfiguration.reroute(location.href, event.type as RouteType);
};

let lastUrl = null;

export function reroute(url: string, type: RouteType | 'init' | 'popstate'| 'hashchange') {
  const { pathname, query, hash } = urlParse(url, true);
  // trigger onRouteChange when url is changed
  if (lastUrl !== url) {
    globalConfiguration.onRouteChange(url, pathname, query, hash, type);

    const unmountApps = [];
    const activeApps = [];
    getMicroApps().forEach((microApp: AppConfig) => {
      const shouldBeActive = microApp.checkActive(url);
      if (shouldBeActive) {
        activeApps.push(microApp);
      } else {
        unmountApps.push(microApp);
      }
    });
    // trigger onActiveApps when url is changed
    globalConfiguration.onActiveApps(activeApps);

    // call captured event after app mounted
    Promise.all(
      // call unmount apps
      unmountApps.map(async (unmountApp) => {
        if (unmountApp.status === MOUNTED || unmountApp.status === LOADING_ASSETS) {
          globalConfiguration.onAppLeave(unmountApp);
        }
        await unmountMicroApp(unmountApp.name);
      }).concat(activeApps.map(async (activeApp) => {
        if (activeApp.status !== MOUNTED) {
          globalConfiguration.onAppEnter(activeApp);
        }
        await createMicroApp(activeApp);
      })),
    ).then(() => {
      callCapturedEventListeners();
    });
  }
  lastUrl = url;
}

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

  window.addEventListener('popstate', urlChange, false);
  window.addEventListener('hashchange', urlChange, false);
};

/**
 * Unhijack window.history
 */
const unHijackHistory = (): void => {
  window.history.pushState = originalPush;
  window.history.replaceState = originalReplace;

  window.removeEventListener('popstate', urlChange, false);
  window.removeEventListener('hashchange', urlChange, false);
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
  // See https://github.com/ice-lab/icestark/issues/373#issuecomment-971366188
  // todos: remove it from 3.x
  if (options?.shouldAssetsRemove) {
    temporaryState.shouldAssetsRemoveConfigured = true;
  }

  if (started) {
    console.log('icestark has been already started');
    return;
  }
  started = true;

  recordAssets();

  // update globalConfiguration
  globalConfiguration.reroute = reroute;
  Object.keys(options || {}).forEach((configKey) => {
    globalConfiguration[configKey] = options[configKey];
  });

  const { prefetch, fetch } = globalConfiguration;
  if (prefetch) {
    doPrefetch(getMicroApps(), prefetch, fetch);
  }

  // hajack history & eventListener
  hijackHistory();
  hijackEventListener();

  // trigger init router
  globalConfiguration.reroute(location.href, 'init');
}

function unload() {
  unHijackEventListener();
  unHijackHistory();
  started = false;
  // remove all assets added by micro apps
  emptyAssets(globalConfiguration.shouldAssetsRemove, true);
  clearMicroApps();
}

export { unload, globalConfiguration };
export default start;
