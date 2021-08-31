import Sandbox from '@ice/sandbox';
import { getGlobalProp, noteGlobalProps } from './global';
import { Asset, fetchScripts, AssetTypeEnum } from './handleAssets';
import { getLifecyleByLibrary, getLifecyleByRegister } from './getLifecycle';
import { asyncForEach } from './helpers';

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
export function loadBundle(jsList: Asset[], sandbox?: Sandbox) {
  return fetchScripts(jsList)
    .then((scriptTexts) => {
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
    });
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
 * Load es modules.
 */
export async function loadESModule(jsList: Asset[]): Promise<null | ModuleLifeCycle> {
  const others = jsList.slice(0, -1);
  await asyncForEach(others, async (js) => {
    if (js.type === AssetTypeEnum.INLINE) {
      executeScripts([js.content]);
    } else {
      await import(/* webpackIgnore: true */js.content);
    }
  });

  /**
  * The last script is supposed to be the entry point which returns lifecycles.
  */
  const lastScript = jsList.slice(-1)[0];

  if (lastScript && lastScript.type === AssetTypeEnum.EXTERNAL) {
    const { mount, unmount } = await import(/* webpackIgnore: true */lastScript.content);

    if (mount && unmount) {
      return {
        mount,
        unmount,
      };
    }
  }
  return null;
}
