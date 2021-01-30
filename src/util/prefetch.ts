import { Prefetch, Fetch } from '../start';
import { MicroApp } from '../apps';
import { NOT_LOADED } from '../util/constant';
import { fetchScripts, fetchStyles, getUrlAssets } from './handleAssets';
import { __DEV__ } from './assist';

/**
 * https://github.com/microsoft/TypeScript/issues/21309#issuecomment-376338415
 */
type RequestIdleCallbackHandle = any;
interface RequestIdleCallbackOptions {
  timeout: number;
}
interface RequestIdleCallbackDeadline {
  readonly didTimeout: boolean;
  timeRemaining: (() => number);
}

declare global {
  interface Window {
    requestIdleCallback: ((
      callback: ((deadline: RequestIdleCallbackDeadline) => void),
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle);
    cancelIdleCallback: ((handle: RequestIdleCallbackHandle) => void);
  }
}

/**
 * polyfill/shim for the `requestIdleCallback` and `cancelIdleCallback`.
 * https://github.com/pladaria/requestidlecallback-polyfill/blob/master/index.js
 */
window.requestIdleCallback =
  window.requestIdleCallback ||
  function(cb) {
    const start = Date.now();
    return setTimeout(function() {
      cb({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };

window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function(id) {
    clearTimeout(id);
  };

function prefetch(fetch = window.fetch) {
  return (app: MicroApp) => {
    window.requestIdleCallback(() => {
      const { jsList, cssList } = getUrlAssets(app.url);
      window.requestIdleCallback(() => fetchScripts(jsList, fetch));
      window.requestIdleCallback(() => fetchStyles(cssList, fetch));
    });
  };
}

const names2PrefetchingApps = (names: string[]) => (app: MicroApp) => names.includes(app.name) && app.status === NOT_LOADED;

const getPrefetchingApps = (apps: MicroApp[]) => (strategy: (app: MicroApp) => boolean) => apps.filter(strategy);

export function doPrefetch(
  apps: MicroApp[],
  prefetchStrategy: Prefetch,
  fetch: Fetch,
) {
  if (Array.isArray(prefetchStrategy)) {
    getPrefetchingApps(apps)(names2PrefetchingApps(prefetchStrategy))
      .forEach(prefetch(fetch));
    return;
  }
  if (typeof prefetchStrategy === 'function') {
    getPrefetchingApps(apps)(prefetchStrategy)
      .forEach(prefetch(fetch));
    return;
  }
  if (prefetchStrategy) {
    getPrefetchingApps(apps)((app) => app.status === NOT_LOADED)
      .forEach(prefetch(fetch));
  }
}