import Sandbox from '@ice/sandbox';
import { getGlobalProp, noteGlobalProps } from './global';

export interface StarkUmdScript {
  url: string | string[];
  mount?: any;
  unmount?: any;
  update?: any;
}

export type Task = Promise<string[]>;

export interface Fetch {
  (input: RequestInfo, init?: RequestInit): Promise<Response>;
}

/**
 * Load umd script and Return scripts as text
 *
 * @export
 * @param {StarkUmdScript} script
 * @param {Fetch} [fetcher=window.fetch]
 * @returns {Task}
 */
export function loadUmdScript(script: StarkUmdScript, fetcher: Fetch = window.fetch): Task {
  const { url } = script;

  const urls = Array.isArray(url) ? url : [url];
  return Promise.all(urls.map(
    scriptUrl => fetcher(scriptUrl)
      .then(response => response.text())
  ));
}


/**
 * Execute umd script
 *
 * @export
 * @param {Task} task
 * @param {Sandbox} [sandbox]
 * @returns
 */
export function execUmdScript(task: Task, sandbox?: Sandbox) {
  return task
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
        console.error('r');
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