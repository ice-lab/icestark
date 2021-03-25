import { Prefetch, Fetch } from '../start';
import { MicroApp, AppConfig } from '../apps';
import { NOT_LOADED } from '../util/constant';
import { fetchScripts, fetchStyles, getUrlAssets, getEntryAssets } from './handleAssets';

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
    window.requestIdleCallback(async () => {
      const { url, entry, entryContent, name } = app;
      const { jsList, cssList } = url ? getUrlAssets(url) : await getEntryAssets({
        entry,
        entryContent,
        assetsCacheKey: name,
        fetch,
      });
      window.requestIdleCallback(() => fetchScripts(jsList, fetch));
      window.requestIdleCallback(() => fetchStyles(cssList, fetch));
    });
  };
}

const names2PrefetchingApps = (names: string[]) => (app: MicroApp) => names.includes(app.name) && (app.status === NOT_LOADED || !app.status);

/**
 * get prefetching apps by strategy
 * @param apps
 * @returns
 */
const getPrefetchingApps = (apps: MicroApp[]) => (strategy: (app: MicroApp) => boolean) => apps.filter(strategy);

export function doPrefetch(
  apps: MicroApp[],
  prefetchStrategy: Prefetch,
  fetch: Fetch,
) {
  const traverse = (strategy: (app: MicroApp) => boolean) => {
    getPrefetchingApps(apps)(strategy)
      .forEach(prefetch(fetch));
  };

  if (Array.isArray(prefetchStrategy)) {
    traverse(names2PrefetchingApps(prefetchStrategy));
    return;
  }
  if (typeof prefetchStrategy === 'function') {
    traverse(prefetchStrategy);
    return;
  }
  if (prefetchStrategy) {
    traverse((app) => app.status === NOT_LOADED || !app.status);
  }
}

export function prefetchApps (apps: AppConfig[], fetch: Fetch) {
  if (apps && Array.isArray(apps)) {
    apps.forEach(prefetch(fetch));
  }
}
