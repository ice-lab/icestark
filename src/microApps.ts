import { SandboxContructor, SandboxProps } from '@ice/sandbox';
import { NOT_LOADED, NOT_MOUNTED, LOADING_ASSETS, UNMOUNTED, LOAD_ERROR, MOUNTED } from './util/constant';
import { matchActivePath } from './util/matchPath';
import { createSandbox, getUrlAssets, getEntryAssets, appendAssets, loadAndAppendCssAssets, emptyAssets, Assets } from './util/handleAssets';
import { getCache } from './util/cache';
import { AppLifeCycleEnum } from './util/appLifeCycle';
import { loadUmdModule } from './util/umdLoader';
import { globalConfiguration } from './start';

interface ActiveFn {
  (url: string): boolean;
}

interface AppLifeCycle {
  mount?: (container: HTMLElement, props: any) => Promise<void> | void;
  unmount?: (container: HTMLElement) => Promise<void> | void;
}

interface ActivePathObject {
  path?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  hashType?: boolean;
}

export interface AppConfig extends ActivePathObject {
  name: string;
  activePath: string | string[] | ActiveFn;
  url?: string | string[];
  container?: HTMLElement;
  status?: string;
  sandbox?: boolean | SandboxProps | SandboxContructor;
  entry?: string;
  entryContent?: string;
  umd?: boolean;
  checkActive?: (url: string) => boolean;
  appAssets?: Assets;
}

// cache all microApp
let microApps = [];

function getAppNames() {
  return microApps.map((app: AppConfig) => app.name);
}

export function getMicroApps() {
  return microApps;
}

export function createMicroApp(appConfig: AppConfig) {
  // check appConfig.name 
  if (getAppNames().includes(appConfig.name)) {
    throw Error(`name ${appConfig.name} already been regsitered`);
  }
  // set activeRules
  const { activePath, hashType = false, exact = false, sensitive = false, strict = false } = appConfig;
  const activeRules = Array.isArray(activePath) ? activePath : [activePath];
  const checkActive = activePath ? (url: string) => activeRules.map((activeRule: ActiveFn | string | ActivePathObject) => {
    if (typeof activeRule === 'function' ) {
      return activeRule;
    } else {
      const pathOptions: ActivePathObject = { hashType, exact, sensitive, strict };
      const pathInfo = Object.prototype.toString.call(activeRule) === '[object Object]'
        ? { ...pathOptions, ...(activeRule as ActivePathObject) }
        : { path: activeRule as string, ...pathOptions };
      return (checkUrl: string) => matchActivePath(checkUrl, pathInfo);
    }
  }).some((activeRule: ActiveFn) => activeRule(url)) : () => true;
  const microApp = {
    status: NOT_LOADED,
    ...appConfig,
    checkActive,
  };
  microApps.push(microApp);
}

export function createMicroApps(appConfigs: AppConfig[]) {
  appConfigs.forEach(appConfig => {
    createMicroApp(appConfig);
  });
}

export function getAppConfig(appName: string) {
  return microApps.find((microApp) => microApp.name === appName);
}

export function updateAppConfig(appName: string, config) {
  microApps = microApps.map((microApp) => {
    if (microApp.name === appName) {
      return {
        ...microApp,
        ...config,
      };
    }
    return microApp;
  });
}

// load app js assets
export async function loadAppModule(appConfig: AppConfig) {
  let lifeCycle: AppLifeCycle = {};
  const appSandbox = createSandbox(appConfig.sandbox);
  const { url, container, entry, entryContent, name } = appConfig;
  const appAssets = url ? getUrlAssets(url) : await getEntryAssets({
    root: container,
    entry,
    href: location.href,
    entryContent,
    assetsCacheKey: name,
  });
  updateAppConfig(appConfig.name, { appAssets });
  if (appConfig.umd) {
    await loadAndAppendCssAssets(appAssets);
    lifeCycle = await loadUmdModule(appAssets.jsList, appSandbox);
  } else {
    await appendAssets(appAssets, appSandbox);
    lifeCycle = {
      mount: getCache(AppLifeCycleEnum.AppEnter),
      unmount: getCache(AppLifeCycleEnum.AppLeave),
    };
  }
  return lifeCycle;
}

export async function loadMicroApp(app: string | AppConfig) {
  const appConfig = typeof app === 'string' ? getAppConfig(app) : app;
  const appName = appConfig.name;
  if (appConfig) {
    // check status of app
    if (appConfig.status === NOT_LOADED) {
      updateAppConfig(appName, { status: LOADING_ASSETS });
      let lifeCycle: AppLifeCycle = {};
      try {
        lifeCycle = await loadAppModule(appConfig);
        updateAppConfig(appName, { ...lifeCycle, status: NOT_MOUNTED });
      } catch {
        updateAppConfig(appName, { status: LOAD_ERROR });
      }
      if (lifeCycle.mount) {
        // check current url before mount
        mountMicroApp(appConfig.name);
      }
    } else {
      console.info(`[icestark] current status of app ${appName} is ${appConfig.status}`);
    }
    return getAppConfig(appName);
  } else if (appConfig.status === UNMOUNTED) {
    if (!appConfig.cached) {
      await loadAndAppendCssAssets(appConfig.appAssets);
    }
    mountMicroApp(appConfig.name);
  } else {
    console.error(`[icestark] fail to get app config of ${appName}`);
  }
  return null;
}

export async function mountMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  if (appConfig && appConfig.checkActive(window.location.href)) {
    await appConfig.mount(appConfig.container, appConfig.props);
    updateAppConfig(appName, { status: MOUNTED });
  }
}

export async function unmountMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  if (appConfig && appConfig.status === MOUNTED) {
    emptyAssets(globalConfiguration.shouldAssetsRemove, !appConfig.cached && appConfig.name);
    await appConfig.unmount(appConfig.container);
    updateAppConfig(appName, { status: UNMOUNTED });
  }
}

export function unloadMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  if (appConfig) {
    unmountMicroApp(appName);
    delete appConfig.mount;
    delete appConfig.unmount;
    delete appConfig.appAssets;
    updateAppConfig(appName, { status: NOT_LOADED });
  } else {
    console.log(`[icestark] can not find app ${appName} when call unloadMicroApp`);
  }
}

export function removeMicroApp(appName: string) {
  const appIndex = getAppNames().indexOf(appName);
  if (appIndex > -1) {
    // unload micro app in case of app is mounted
    unloadMicroApp(appName);
    microApps.splice(appIndex, 1);
  } else {
    console.log(`[icestark] can not find app ${appName} when call removeMicroApp`);
  }
}

