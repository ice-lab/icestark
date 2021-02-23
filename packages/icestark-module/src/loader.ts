import Sandbox from '@ice/sandbox';
import { getGlobalProp, noteGlobalProps } from './global';
import { StarkModule } from './modules';

export interface ImportTask {
  [name: string]: Promise<string[]>;
};

export type PromiseModule = Promise<Response>;

export interface Fetch {
  (input: RequestInfo, init?: RequestInit): Promise<Response>;
}

function mergeWindowWithDeps (deps?: object) {
  const localWindow = {};
  Object.keys(window)
    .forEach(key => {
      /*
      * matchMedia is bound to the window scope intentionally as it is an illegal invocation to
      * call it from a different scope. https://github.com/angular/components/blob/master/src/cdk/layout/media-matcher.ts
      */
      if (key === 'matchMedia') {
        window.matchMedia.bind(window);
      } else {
        localWindow[key] = window[key];
      }
    });
  return Object.assign(localWindow, deps);
}

export default class ModuleLoader {
  private importTask: ImportTask = {};

  load(starkModule: StarkModule, fetch: Fetch = window.fetch): Promise<string[]> {
    const { url, name } = starkModule;
    if (this.importTask[name]) {
      // return promise if current module is pending or resolved
      return this.importTask[name];
    }
    const urls = Array.isArray(url) ? url : [url];

    const task = Promise.all(urls.map((scriptUrl) => fetch(scriptUrl).then((res) => res.text())));
    this.importTask[name] = task;
    return task;
  }

  clearTask() {
    this.importTask = {};
  }

  execModule(starkModule: StarkModule, sandbox?: Sandbox, deps?: object) {
    return this.load(starkModule).then((sources) => {
      let globalWindow = null;
      if (sandbox?.getSandbox) {
        sandbox.createProxySandbox(deps);
        globalWindow = sandbox.getSandbox();
      } else {
        globalWindow = mergeWindowWithDeps(deps);
      }
      const { name } = starkModule;
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

            // eslint-disable-next-line no-new-func
            const code = new Function('window', source).bind(globalWindow);
            code(globalWindow);
            // eslint-disable-next-line no-eval
            // (0, eval)(wrapSource(source));
          }
          if (lastScript) {
            libraryExport = getGlobalProp(globalWindow);
          }
        });
      } catch (err) {
        console.error(err);
      }
      const moduleInfo = libraryExport ? (globalWindow as any)[libraryExport] : ((globalWindow as any)[name] || {});
      // remove moduleInfo from globalWindow in case of excute multi module in globalWindow
      if ((globalWindow as any)[libraryExport]) {
        delete globalWindow[libraryExport];
      }
      return moduleInfo;
    });
  }
};
