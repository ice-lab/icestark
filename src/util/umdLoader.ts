import Sandbox from '@ice/sandbox';
import { getGlobalProp, noteGlobalProps } from './global';
import { Asset, fetchScripts } from './handleAssets';

export interface StarkModule {
  cacheKey: string;
  jsList: Asset[];
  mount?: (Component: any, targetNode: HTMLElement, props?: any) => void;
  unmount?: (targetNode: HTMLElement) => void;
};

export interface ImportTask {
  [cacheKey: string]: Promise<string[]>;
};

export type PromiseModule = Promise<Response>;

export interface Fetch {
  (input: RequestInfo, init?: RequestInit): Promise<Response>;
}

export default class ModuleLoader {
  private importTask: ImportTask = {};

  load(starkModule: StarkModule): Promise<string[]> {
    const { jsList, cacheKey } = starkModule;
    if (this.importTask[cacheKey]) {
      // return promise if current module is pending or resolved
      return this.importTask[cacheKey];
    }
    const task = fetchScripts(jsList);
    this.importTask[cacheKey] = task;
    return task;
  }

  clearTask() {
    this.importTask = {};
  }

  execModule(starkModule: StarkModule, sandbox?: Sandbox) {
    return this.load(starkModule).then((sources) => {
      const globalWindow = getGobalWindow(sandbox);
      const { cacheKey } = starkModule;
      let libraryExport = '';
      // excute script in order
      try {
        sources.forEach((source, index) => {
          const lastScript = index === sources.length - 1;
          if (lastScript) {
            noteGlobalProps(globalWindow);
          }
          // check sandbox
          if (sandbox?.execScriptInSandbox) {
            sandbox.execScriptInSandbox(source);
          } else {
            // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval
            // eslint-disable-next-line no-eval
            (0, eval)(source);
          }
          if (lastScript) {
            libraryExport = getGlobalProp(globalWindow);
          }
        });
      } catch (err) {
        console.error(err);
      }
      const moduleInfo = libraryExport ? (globalWindow as any)[libraryExport] : ((globalWindow as any)[cacheKey] || {});
      // remove moduleInfo from globalWindow in case of excute multi module in globalWindow
      if ((globalWindow as any)[libraryExport]) {
        delete globalWindow[libraryExport];
      }
      return moduleInfo;
    });
  }
};

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