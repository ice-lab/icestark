import Sandbox, { SandboxProps, SandboxConstructor } from '@ice/sandbox';
import ModuleLoader from './loader';
import { Runtime, parseRuntime, RuntimeInstance } from './runtimeHelper';

export interface StarkModule {
  name: string;
  url?: string | string[];
  /**
   * you are not expected to use it without the wrapper `<MicroModule />`
   */
  render?: (props: StarkModule) => any;
  runtime?: Runtime;
  mount?: (Component: any, targetNode: HTMLElement, props?: any) => void;
  unmount?: (targetNode: HTMLElement) => void;
}

export type ISandbox = boolean | SandboxProps | SandboxConstructor;

let globalModules = [];
let importModules = {};
// store css link
const cssStorage = {};

const IS_CSS_REGEX = /\.css(\?((?!\.js$).)+)?$/;
export const moduleLoader = new ModuleLoader();

export const registerRuntimes = (runtime: string | RuntimeInstance[]) => {
  return parseRuntime(runtime);
};

/**
 * remove module
 * @param name
 */
export const removeModule = (name?: string) => {
  globalModules = globalModules.filter((m) => m.name !== name);
  delete importModules[name];
  moduleLoader.removeTask(name);
};

/**
 * clear modules
 */
export const clearModules = () => {
  // reset module info
  globalModules = [];
  importModules = {};
  moduleLoader.clearTask();
};

/**
 * registerModule
 * @param module
 * @returns
 */
export const registerModule = (module: StarkModule) => {
  if (!module.url && !module.render) {
    console.error('[icestark module] url and render cannot both be empty. name: %s', module.name);
    return;
  }
  const hasRegistered = globalModules.filter((m) => m.name === module.name).length;

  /*
   * If a module registers many times, the former registration will be removed.
   */
  if (hasRegistered) {
    removeModule(module.name);
  }
  globalModules.push(module);
};

export const registerModules = (modules: StarkModule[]) => {
  modules.forEach((m) => registerModule(m));
};

// if css link already loaded, record load count
const filterAppendCSS = (cssList: string[]) => {
  return (cssList || []).filter((cssLink) => {
    if (cssStorage[cssLink]) {
      cssStorage[cssLink] += 1;
      return false;
    } else {
      cssStorage[cssLink] = 1;
      return true;
    }
  });
};

const filterRemoveCSS = (cssList: string[]) => {
  return (cssList || []).filter((cssLink) => {
    if (cssStorage[cssLink] > 1) {
      cssStorage[cssLink] -= 1;
      return false;
    } else {
      delete cssStorage[cssLink];
      return true;
    }
  });
};

function createSandbox(sandbox: ISandbox, deps?: object) {
  let moduleSandbox = null;

  if (deps || sandbox) {
    if (sandbox) {
      if (typeof sandbox === 'function') {
        // eslint-disable-next-line new-cap
        moduleSandbox = new sandbox();
      } else {
        const sandboxProps = typeof sandbox === 'boolean' ? {} : sandbox;
        moduleSandbox = new Sandbox(sandboxProps);
      }
    } else {
      moduleSandbox = new Sandbox();
    }
  }
  return moduleSandbox;
}

/**
 * parse url assets
 */
export const parseUrlAssets = (assets: string | string[]) => {
  const jsList = [];
  const cssList = [];
  (Array.isArray(assets) ? assets : [assets]).forEach((url) => {
    const isCss: boolean = IS_CSS_REGEX.test(url);
    if (isCss) {
      cssList.push(url);
    } else {
      jsList.push(url);
    }
  });

  return { jsList, cssList };
};

export function appendCSS(
  name: string,
  url: string,
  root: HTMLElement | ShadowRoot = document.getElementsByTagName('head')[0],
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!root) reject(new Error(`no root element for css assert: ${url}`));

    const element: HTMLLinkElement = document.createElement('link');
    element.setAttribute('module', name);
    element.rel = 'stylesheet';
    element.href = url;

    element.addEventListener(
      'error',
      () => {
        console.error(`css asset loaded error: ${url}`);
        return resolve();
      },
      false,
    );
    element.addEventListener('load', () => resolve(), false);

    root.appendChild(element);
  });
}

/**
 * remove css
 */

export function removeCSS(name: string, node?: HTMLElement | Document, removeList?: string[]) {
  const linkList: NodeListOf<HTMLElement> = (node || document).querySelectorAll(
    `link[module=${name}]`,
  );
  linkList.forEach((link) => {
    // check link href if it is in remove list
    // compatible with removeList is undefined
    if ((removeList && removeList.includes(link.getAttribute('href'))) || !removeList) {
      link.parentNode.removeChild(link);
    }
  });
}

/**
 * return globalModules
 */
export const getModules = function () {
  return globalModules || [];
};

/**
 * get import modules
 */
export const getImportModules = function (name: string = '') {
  return name ? importModules[name] || {} : importModules;
};

/**
 * load module source
 */
export const loadModule = async (targetModule: StarkModule, sandbox?: ISandbox) => {
  const { name, url, runtime } = targetModule;

  let moduleSandbox = null;

  if (!importModules[name]) {
    let deps = null;
    if (runtime) {
      deps = await parseRuntime(runtime);
    }

    const { jsList, cssList } = parseUrlAssets(url);
    moduleSandbox = createSandbox(sandbox, deps);
    const moduleInfo = await moduleLoader.execModule({ name, url: jsList }, moduleSandbox, deps);
    importModules[name] = {
      moduleInfo,
      moduleSandbox,
      moduleCSS: cssList,
    };
  }

  const { moduleInfo, moduleCSS } = importModules[name];

  if (!moduleInfo) {
    const errMsg = 'load or exec module faild';
    console.error(errMsg);
    return Promise.reject(new Error(errMsg));
  }

  const mount = targetModule.mount || moduleInfo?.mount;
  const unmount = targetModule.unmount || moduleInfo?.unmount;
  const component = moduleInfo.default || moduleInfo;

  if (!mount || !unmount) {
    console.error('[icestark module] Please export mount/unmount function');
  }

  // append css before mount module
  const cssList = filterAppendCSS(moduleCSS);
  if (cssList.length) {
    await Promise.all(cssList.map((css: string) => appendCSS(name, css)));
  }

  return {
    mount,
    unmount,
    component,
    moduleInfo,
  };
};

/**
 * mount module function
 */
export const mountModule = async (targetModule: StarkModule, targetNode: HTMLElement, props: any = {}, sandbox?: ISandbox) => {
export const mountModule = async (
  targetModule: StarkModule,
  targetNode: HTMLElement,
  props: any = {},
  sandbox?: ISandbox,
) => {
  const { mount, component } = await loadModule(targetModule, sandbox);
  return mount(component, targetNode, props);
};

/**
 * unmount module function
 */
export const unmoutModule = (targetModule: StarkModule, targetNode: HTMLElement) => {
  const { name } = targetModule;
  const moduleInfo = importModules[name]?.moduleInfo;
  const moduleSandbox = importModules[name]?.moduleSandbox;
  const unmount = targetModule.unmount || moduleInfo?.unmount;
  const cssList = filterRemoveCSS(importModules[name]?.moduleCSS);
  removeCSS(name, document, cssList);
  if (moduleSandbox?.clear) {
    moduleSandbox.clear();
  }

  if (unmount && targetNode) {
    return unmount(targetNode);
  }
};
