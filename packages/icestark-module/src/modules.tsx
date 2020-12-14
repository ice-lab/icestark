import Sandbox, { SandboxProps, SandboxContructor } from '@ice/sandbox';
import ModuleLoader, { StarkModule } from './loader';

export type ISandbox = boolean | SandboxProps | SandboxContructor;

let globalModules = [];
let importModules = {};

const IS_CSS_REGEX = /\.css(\?((?!\.js$).)+)?$/;
export const moduleLoader = new ModuleLoader();

export const registerModules = (modules: StarkModule[]) => {
  globalModules = modules;
};

export const clearModules = () => {
  // reset module info
  globalModules = [];
  importModules = {};
  moduleLoader.clearTask();
};
/**
 * support react module render
 */
const defaultMount = () => {
  console.error('[icestark module] Please export mount function');
};

/**
 * default unmount function
 */
const defaultUnmount = () => {
  console.error('[icestark module] Please export unmount function');
};

function createSandbox(sandbox: ISandbox) {
  let moduleSandbox = null;
  if (sandbox) {
    if (typeof sandbox === 'function') {
      // eslint-disable-next-line new-cap
      moduleSandbox = new sandbox();
    } else {
      const sandboxProps = typeof sandbox === 'boolean' ? {} : sandbox;
      moduleSandbox = new Sandbox(sandboxProps);
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
  (Array.isArray(assets) ? assets : [assets]).forEach(url => {
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
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
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

export function removeCSS(name: string, node?: HTMLElement | Document) {
  const linkList: NodeListOf<HTMLElement> = (node || document).querySelectorAll(
    `link[module=${name}]`,
  );
  linkList.forEach(link => {
    link.parentNode.removeChild(link);
  });
}

/**
 * return globalModules
*/
export const getModules = function () {
  return globalModules || [];
};

/**
 * load module source
 */

export const loadModule = async(targetModule: StarkModule, sandbox?: ISandbox) => {
  const { name, url } = targetModule;
  let moduleSandbox = null;
  if (!importModules[name]) {
    const { jsList, cssList } = parseUrlAssets(url);
    moduleSandbox = createSandbox(sandbox);
    const moduleInfo = await moduleLoader.execModule({ name, url: jsList }, moduleSandbox);
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

  const mount = targetModule.mount || moduleInfo?.mount || defaultMount;
  const component = moduleInfo.default || moduleInfo;

  // append css before mount module
  if (moduleCSS.length) {
    await Promise.all(moduleCSS.map((css: string) => appendCSS(name, css)));
  }

  return {
    mount,
    component,
  };
};

/**
 * mount module function
 */
export const mountModule = async (targetModule: StarkModule, targetNode: HTMLElement, props: any = {}, sandbox?: ISandbox) => {
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
  const unmount = targetModule.unmount || moduleInfo?.unmount || defaultUnmount;
  removeCSS(name);
  if (moduleSandbox?.clear) {
    moduleSandbox.clear();
  }

  return unmount(targetNode);
};

