import Sandbox from '@ice/sandbox';
import { getGlobalProp, noteGlobalProps } from './global';
import { Asset, fetchScripts, AssetTypeEnum } from './handleAssets';
import { getLifecyleByLibrary, getLifecyleByRegister } from './getLifecycle';
import { asyncForEach } from './helpers';


import type { ModuleLifeCycle } from '../apps';

/**
 * load bundle
 *
 * @param {Asset[]} jsList
 * @param {Sandbox} [sandbox]
 */
export function loadBundle(jsList: Asset[], sandbox?: Sandbox) {
  return fetchScripts(jsList)
    .then((scriptTexts) => {
      const globalwindow = getGobalWindow(sandbox);
      let libraryExport = null;
      // exeute script in order
      try {
        scriptTexts.forEach((script, index) => {
          const lastScript = index === scriptTexts.length - 1;
          if (lastScript) {
            noteGlobalProps(globalwindow);
          }
          // check sandbox
          if (sandbox?.execScriptInSandbox) {
            sandbox.execScriptInSandbox(script);
          } else {
            // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval
            // eslint-disable-next-line no-eval
            (0, eval)(script);
          }
          if (lastScript) {
            libraryExport = getGlobalProp(globalwindow);
          }
        });
      } catch (err) {
        console.error(err);
      }

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
export async function loadESModule(jsList: Asset[]) {
  const others = jsList.slice(0, -1);
  // FIXME: types
  await asyncForEach(others, (js: any): any => {
    if (js.type === AssetTypeEnum.INLINE) {
      // FIXME: how handle inline
    } else {
      import(js.content);
    }
  });

  const lastScript = jsList.slice(-1)[0];

  // FIXME: show useful infos
  if (lastScript && lastScript.type === AssetTypeEnum.EXTERNAL) {
    const { mount, unmount } = await import(lastScript.content);

    if (mount && unmount) {
      return {
        mount,
        unmount,
      };
    }
  }
  return null;
}
