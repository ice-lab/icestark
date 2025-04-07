import Sandbox from '@ice/sandbox';
import { getGlobalProp, noteGlobalProps } from './global';
import { Asset, fetchScripts, AssetTypeEnum, appendExternalScript } from './handleAssets';
import { getLifecyleByLibrary, getLifecyleByRegister } from './getLifecycle';
import { asyncForEach, isDev } from './helpers';
import { ErrorCode, formatErrMessage } from './error';
import { PREFIX } from './constant';

import type { ModuleLifeCycle } from '../apps';

function executeScripts(scripts: string[], sandbox?: Sandbox, globalwindow: Window = window) {
  let libraryExport = null;

  for (let idx = 0; idx < scripts.length; ++idx) {
    const lastScript = idx === scripts.length - 1;
    if (lastScript) {
      noteGlobalProps(globalwindow);
    }

    if (sandbox?.execScriptInSandbox) {
      sandbox.execScriptInSandbox(scripts[idx]);
    } else {
      // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval
      // eslint-disable-next-line no-eval
      (0, eval)(scripts[idx]);
    }

    if (lastScript) {
      libraryExport = getGlobalProp(globalwindow);
    }
  }

  return libraryExport;
}

/**
 * load bundle
 */
export async function loadScriptByFetch(jsList: Asset[], sandbox?: Sandbox, fetch = window.fetch) {
  const scriptTexts = await fetchScripts(jsList, fetch);
  const globalwindow = getGobalWindow(sandbox);
  const libraryExport = executeScripts(scriptTexts, sandbox, globalwindow);
  let moduleInfo = getLifecyleByLibrary() || getLifecyleByRegister();
  if (!moduleInfo) {
    moduleInfo = (libraryExport ? globalwindow[libraryExport] : {}) as ModuleLifeCycle;
    if (globalwindow[libraryExport]) {
      delete globalwindow[libraryExport];
    }
  }

  return moduleInfo;
}

/**
 * Get globalwindow
 *
 * @export
 * @param {Sandbox} [sandbox]
 * @returns
 */
export function getGobalWindow(sandbox?: Sandbox) {
  if (sandbox?.getSandbox) {
    sandbox.createProxySandbox();
    return sandbox.getSandbox();
  }
  // FIXME: If run in Node environment
  return window;
}

/**
 * Load es modules and get lifecycles sequentially.
 * `import` returns a promise for the module namespace object of the requested module which means
 * + non-export returns empty object
 * + default export return object with `default` key
 */
export async function loadScriptByImport(jsList: Asset[]): Promise<null | ModuleLifeCycle> {
  let mount = null;
  let unmount = null;
  await asyncForEach(jsList, async (js, index) => {
    if (js.type === AssetTypeEnum.INLINE) {
      await appendExternalScript(js, {
        id: `${PREFIX}-js-module-${index}`,
      });
    } else {
      let dynamicImport = null;
      try {
        /**
        * `import` will cause error under chrome 61 and ie.
        * Then use `new Function` to escape compile error.
        * Inspired by [dynamic-import-polyfill](https://github.com/GoogleChromeLabs/dynamic-import-polyfill)
        */
        // eslint-disable-next-line no-new-func
        dynamicImport = new Function('url', 'return import(url)');
      } catch (e) {
        return Promise.reject(
          new Error(
            formatErrMessage(
              ErrorCode.UNSUPPORTED_IMPORT_BROWSER,
              isDev && 'You can not use loadScriptMode = import where dynamic import is not supported by browsers.',
            ),
          ),
        );
      }

      try {
        if (dynamicImport) {
          const { mount: maybeMount, unmount: maybeUnmount } = await dynamicImport(js.content);

          if (maybeMount && maybeUnmount) {
            mount = maybeMount;
            unmount = maybeUnmount;
          }
        }
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });

  if (mount && unmount) {
    return {
      mount,
      unmount,
    };
  }

  return null;
}
