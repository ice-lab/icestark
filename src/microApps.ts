import * as urlParse from 'url-parse';
import { NOT_LOADED, NOT_MOUNTED, LOADING_ASSETS, UNMOUNTED, LOAD_ERROR, MOUNTED } from './util/constant';
import matchPath from './util/matchPath';
import { createSandbox, getUrlAssets, getEntryAssets, appendAssets, loadAndAppendCssAssets } from './util/handleAssets';
import { getCache } from './util/cache';
import { AppLifeCycleEnum } from './util/appLifeCycle';
import { loadUmdModule } from './util/umdLoader';

interface ActiveFn {
  (url: string): boolean;
}

interface AppLifeCycle {
  mount?: (container: HTMLElement, props: any) => void;
  unmount?: (container: HTMLElement) => void;
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
}

// cache all microApp
let microApps = [];

function getAppNames() {
  return microApps.map((app: AppConfig) => app.name);
}

export function createMicroApp(appConfig: AppConfig) {
  // check appConfig.name 
  if (getAppNames().includes(appConfig.name)) {
    throw Error(`name ${appConfig.name} already been regsitered`);
  }
  // set activeRules
  const { activePath, hashType = false, exact = false, sensitive = false, strict = false } = appConfig;
  let activeRules = Array.isArray(activePath) ? activePath : [activePath];
  activeRules = activeRules.map((activeRule: ActiveFn | string | ActivePathObject) => {
    if (typeof activeRule === 'function' ) {
      return activeRule;
    } else {
      const pathOptions: ActivePathObject = { hashType, exact, sensitive, strict };
      const pathInfo = Object.prototype.toString.call(activeRule) === '[object Object]'
        ? { ...pathOptions, ...(activeRule as ActivePathObject) }
        : { path: activeRule as string, ...pathOptions };
      return (checkUrl: string) => matchActivePath(checkUrl, pathInfo);
    }
  });
  const microApp = {
    status: NOT_LOADED,
    ...appConfig,
    activeRules,
  };
  microApps.push(microApp);
}

export function removeMicroApp(appName: string) {
  const appIndex = getAppNames().indexOf(appName);
  microApps.splice(appIndex, 1);
}

export function getAppConfig(appName: string) {
  return microApps.find((microApp) => microApp.name === appName);
}

export function updateAppConfig(appName: string, config) {
  microApps = microApps.map((microApp) => {
    if (microApp.appName === appName) {
      return {
        ...microApp,
        ...config,
      };
    }
    return microApp;
  });
}

export async function loadMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  if (appConfig) {
    // check status of app
    if (appConfig.status === NOT_LOADED) {
      updateAppConfig(appName, { status: LOADING_ASSETS });
      try {
        const appSandbox = createSandbox(appConfig.sandbox);
        const { url, container, entry, entryContent, name } = appConfig;
        const appAssets = url ? getUrlAssets(url) : await getEntryAssets({
          root: container,
          entry,
          href: location.href,
          entryContent,
          assetsCacheKey: name,
        });
        let lifeCycle: AppLifeCycle = {};
        if (appConfig.umd) {
          await loadAndAppendCssAssets(appAssets);
          lifeCycle = await loadUmdModule(appAssets.jsList);
        } else {
          await appendAssets(appAssets, appSandbox);
          lifeCycle = {
            mount: getCache(AppLifeCycleEnum.AppEnter),
            unmount: getCache(AppLifeCycleEnum.AppLeave),
          };
        }
        updateAppConfig(appName, {...lifeCycle, status: NOT_MOUNTED });
      } catch {
        updateAppConfig(appName, { status: LOAD_ERROR });
      }
    } else {
      console.info(`[icestark] current status of app ${appName} is ${appConfig.status}`);
    }
    return getAppConfig(appName);
  } else {
    console.error(`[icestark] fail to get app config of ${appName}`);
  }
  return null;
}

export function mountMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  if (appConfig && appConfig.status === NOT_MOUNTED) {
    appConfig.mount(appConfig.container, appConfig.props);
    updateAppConfig(appName, { status: MOUNTED });
  }
}

export function unmountMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  if (appConfig && appConfig.status === UNMOUNTED) {
    appConfig.unmount(appConfig.container);
    updateAppConfig(appName, { status: UNMOUNTED });
  }
}

export function unloadMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  if (appConfig) {
    delete appConfig.mount;
    delete appConfig.unmount;
    updateAppConfig(appName, { status: NOT_LOADED });
  }
}

function addLeadingSlash(path: string): string {
  return path.charAt(0) === '/' ? path : `/${path}`;
}

function getHashPath(hash: string = '/'): string {
  const hashIndex = hash.indexOf('#');
  const hashPath = hashIndex === -1 ? hash : hash.substr(hashIndex + 1);

  // remove hash query
  const searchIndex = hashPath.indexOf('?');
  return searchIndex === -1 ? hashPath : hashPath.substr(0, searchIndex);
}

const HashPathDecoders = {
  hashbang: (path: string) => (path.charAt(0) === '!' ? path.substr(1) : path),
  noslash: addLeadingSlash,
  slash: addLeadingSlash,
};

export function matchActivePath(url: string, pathInfo: ActivePathObject) {
  const { pathname, hash } = urlParse(url, true);
  const { hashType } = pathInfo;
  let checkPath = pathname;
  if (hashType) {
    const decodePath = HashPathDecoders[hashType === true ? 'slash' : hashType];
    checkPath = decodePath(getHashPath(hash));
  }
  return matchPath(checkPath, pathInfo);
}

export function getActivedApps(url: string) {
  const activeApps = [];
  microApps.forEach((microApp) => {
    const { activeRules } = microApp;
    if (activeRules.some((activeRule: ActiveFn) => activeRule(url))) {
      activeApps.push(microApp);
    }
  });
  return activeApps;
}
