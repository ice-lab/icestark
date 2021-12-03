import { fetchScripts, fetchStyles, getUrlAssets, getEntryAssets } from './handleAssets';
import { NOT_LOADED } from '../util/constant';
import type { Fetch } from '../util/globalConfiguration';
import type { MicroApp, AppConfig } from '../apps';

export type Prefetch =
 | boolean
 | string[]
 | ((app: AppConfig) => boolean);


/**
 * polyfill/shim for the `requestIdleCallback` and `cancelIdleCallback`.
 * https://github.com/pladaria/requestidlecallback-polyfill/blob/master/index.js
 */
window.requestIdleCallback =
  window.requestIdleCallback ||
  function (cb) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  // TypeScript > 4.x no longer supports merging window's properties types like before.
  } as any as typeof window.requestIdleCallback;

window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };

function prefetchIdleTask(fetch = window.fetch) {
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
  const executeAllPrefetchTasks = (strategy: (app: MicroApp) => boolean) => {
    getPrefetchingApps(apps)(strategy)
      .forEach(prefetchIdleTask(fetch));
  };

  if (Array.isArray(prefetchStrategy)) {
    executeAllPrefetchTasks(names2PrefetchingApps(prefetchStrategy));
    return;
  }
  if (typeof prefetchStrategy === 'function') {
    executeAllPrefetchTasks(prefetchStrategy);
    return;
  }
  if (prefetchStrategy) {
    executeAllPrefetchTasks((app) => app.status === NOT_LOADED || !app.status);
  }
}

export function prefetchApps(apps: AppConfig[], fetch: Fetch = window.fetch) {
  if (apps && Array.isArray(apps)) {
    apps.forEach(prefetchIdleTask(fetch));
  }
}
