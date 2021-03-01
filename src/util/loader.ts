import Sandbox from '@ice/sandbox';
import { getGlobalProp, noteGlobalProps } from './global';
import { Asset, fetchScripts } from './handleAssets';
import { getLifecyleByLibrary, getLifecyleByRegister } from './getLifecycle';
import { ModuleLifeCycle } from '../apps';

/**
 * load bundle
 *
 * @param {Asset[]} jsList
 * @param {Sandbox} [sandbox]
 */
export function loadBundle(jsList: Asset[], sandbox?: Sandbox) {
  return fetchScripts(jsList)
    .then(scriptTexts => {
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