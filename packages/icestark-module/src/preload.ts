import { StarkModule, execModule, getModules, ISandbox, getImportedModules } from './modules';

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
   };

window.cancelIdleCallback =
   window.cancelIdleCallback ||
   function (id) {
     clearTimeout(id);
   };

export function preloadModules(modules: StarkModule[] | string[], sandbox?: ISandbox): void {
  if (!modules?.length) {
    return;
  }
  modules.forEach((module) => {
    const moduleInfo: StarkModule = typeof module === 'string' ? getModules().filter((m) => m.name === module)[0] : module;
    if (!moduleInfo) {
      console.error('Can\'t find module in modules config');
      return;
    }
    const notImported = !Object.keys(getImportedModules()).includes(moduleInfo.name);
    if (notImported) {
      window.requestIdleCallback(() => execModule(moduleInfo, sandbox));
    }
  });
}

