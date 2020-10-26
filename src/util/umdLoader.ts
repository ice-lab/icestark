import Sandbox from '@ice/sandbox';
import { getGlobalProp, noteGlobalProps } from './global';
import { Asset, fetchScripts } from './handleAssets';

/**
 * load umd bundle
 *
 * @param {Asset[]} jsList
 * @param {Sandbox} [sandbox]
 */
export function loadUmdModule(jsList: Asset[], sandbox?: Sandbox) {
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

      const moduleInfo = libraryExport ? globalwindow[libraryExport] : {};
      if (globalwindow[libraryExport]) {
        delete globalwindow[libraryExport];
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