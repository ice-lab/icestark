import { Prefetch, Fetch } from '../start';
import { AppConfig } from '../apps';

/**
 * https://github.com/microsoft/TypeScript/issues/21309#issuecomment-376338415
 */
type RequestIdleCallbackHandle = any;
type RequestIdleCallbackOptions = {
  timeout: number;
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: (() => number);
};

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
    var start = Date.now();
    return setTimeout(function() {
        cb({
            didTimeout: false,
            timeRemaining: function() {
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

export function prefetch() {
  if ()
}


export function doPrefetch(apps: AppConfig[], prefetchStrategy: Prefetch, fetch: Fetch) {

}