import Sandbox, { SandboxConstructor, SandboxProps } from '@ice/sandbox';
import isEmpty from 'lodash.isempty';
import { NOT_LOADED, NOT_MOUNTED, LOADING_ASSETS, UNMOUNTED, LOAD_ERROR, MOUNTED } from './util/constant';
import checkUrlActive, { ActivePath, PathOption, formatPath } from './util/checkActive';
import {
  createSandbox,
  getUrlAssets,
  getEntryAssets,
  loadAndAppendCssAssets,
  loadAndAppendJsAssets,
  emptyAssets,
  filterRemovedAssets,
  Assets,
} from './util/handleAssets';
import { setCache } from './util/cache';
import { loadScriptByFetch, loadScriptByImport } from './util/loaders';
import { getLifecyleByLibrary, getLifecyleByRegister } from './util/getLifecycle';
import { mergeFrameworkBaseToPath, getAppBasename, shouldSetBasename } from './util/helpers';
import globalConfiguration, { temporaryState } from './util/globalConfiguration';

import type { StartConfiguration } from './util/globalConfiguration';

export type ScriptAttributes = string[] | ((url: string) => string[]);

const importCachedAssets: {
  [index: string]: HTMLElement[];
} = {};

interface LifecycleProps {
  container: HTMLElement | string;
  customProps?: object;
}

export interface ModuleLifeCycle {
  mount?: (props: LifecycleProps) => Promise<void> | void;
  unmount?: (props: LifecycleProps) => Promise<void> | void;
  update?: (props: LifecycleProps) => Promise<void> | void;
  bootstrap?: (props: LifecycleProps) => Promise<void> | void;
}

export interface BaseConfig extends PathOption {
  name?: string;
  url?: string | string[];
  activePath?: ActivePath;
  container?: HTMLElement;
  status?: string;
  sandbox?: boolean | SandboxProps | SandboxConstructor;
  entry?: string;
  entryContent?: string;
  /**
  * basename is used for setting custom basename for child's basename.
  */
  basename?: string;
  /**
   * will be deprecated in future version, use `loadScriptMode` instead.
   * @see loadScriptMode
   * @deprecated
   */
  umd?: boolean;
  loadScriptMode?: 'fetch' | 'script' | 'import';
  checkActive?: (url: string) => boolean;
  appAssets?: Assets;
  props?: object;
  cached?: boolean;
  title?: string;
  /**
   * custom script attributes，only effective when scripts load by `<scrpit />`
   */
  scriptAttributes?: ScriptAttributes;
}

interface LifeCycleFn {
  (app: AppConfig): void;
}

interface AppLifecylceOptions {
  beforeMount?: LifeCycleFn;
  afterMount?: LifeCycleFn;
  beforeUnmount?: LifeCycleFn;
  afterUnmount?: LifeCycleFn;
  beforeUpdate?: LifeCycleFn;
  afterUpdate?: LifeCycleFn;
}

export interface AppConfig extends BaseConfig {
  appLifecycle?: AppLifecylceOptions;
  appSandbox?: Sandbox;
}

export interface MicroApp extends AppConfig, ModuleLifeCycle {
  configuration?: StartConfiguration;
}

// cache all microApp
let microApps: MicroApp[] = [];
(window as any).microApps = microApps;

function getAppNames() {
  return microApps.map((app) => app.name);
}

export function getMicroApps() {
  return microApps;
}

export function getAppStatus(appName: string) {
  const app = microApps.find((microApp) => appName === microApp.name);
  return app ? app.status : '';
}

export function registerMicroApp(appConfig: AppConfig, appLifecyle?: AppLifecylceOptions) {
  // check appConfig.name
  if (getAppNames().includes(appConfig.name)) {
    throw Error(`name ${appConfig.name} already been regsitered`);
  }

  const { activePath, hashType = false, exact = false, sensitive = false, strict = false } = appConfig;

  /**
   * Format activePath in advance
   */
  const activePathArray = formatPath(activePath, {
    hashType,
    exact,
    sensitive,
    strict,
  });

  const { basename: frameworkBasename } = globalConfiguration;

  const checkActive = checkUrlActive(mergeFrameworkBaseToPath(activePathArray, frameworkBasename));

  const microApp = {
    status: NOT_LOADED,
    ...appConfig,
    appLifecycle: appLifecyle,
    checkActive,
  };

  microApps.push(microApp);
}

export function registerMicroApps(appConfigs: AppConfig[], appLifecyle?: AppLifecylceOptions) {
  appConfigs.forEach((appConfig) => {
    registerMicroApp(appConfig, appLifecyle);
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
  const { onLoadingApp, onFinishLoading, fetch } = getAppConfig(appConfig.name)?.configuration || globalConfiguration;

  let lifecycle: ModuleLifeCycle = {};
  onLoadingApp(appConfig);
  const appSandbox = createSandbox(appConfig.sandbox) as Sandbox;
  const { url, container, entry, entryContent, name, scriptAttributes = [], umd } = appConfig;
  const appAssets = url ? getUrlAssets(url) : await getEntryAssets({
    root: container,
    entry,
    href: location.href,
    entryContent,
    assetsCacheKey: name,
    fetch,
  });
  updateAppConfig(appConfig.name, { appAssets, appSandbox });

  /**
   * LoadScriptMode has the first priority
   */
  const sandboxEnabled = appSandbox && !appSandbox.sandboxDisabled;
  const loadScriptMode = appConfig.loadScriptMode ?? (umd || sandboxEnabled ? 'fetch' : 'script');

  const cacheCss = temporaryState.shouldAssetsRemoveConfigured ? false : (loadScriptMode !== 'script');

  switch (loadScriptMode) {
    case 'import':
      await loadAndAppendCssAssets([
        ...appAssets.cssList,
        ...filterRemovedAssets(importCachedAssets[name] || [], ['LINK', 'STYLE']),
      ], {
        cacheCss,
        fetch,
      });
      lifecycle = await loadScriptByImport(appAssets.jsList);
      // Not to handle script element temporarily.
      break;
    case 'fetch':
      await loadAndAppendCssAssets(appAssets.cssList, {
        cacheCss,
        fetch,
      });
      lifecycle = await loadScriptByFetch(appAssets.jsList, appSandbox);
      break;
    default:
      await Promise.all([
        loadAndAppendCssAssets(appAssets.cssList, {
          cacheCss,
          fetch,
        }),
        loadAndAppendJsAssets(appAssets, { scriptAttributes }),
      ]);
      lifecycle =
        getLifecyleByLibrary() ||
        getLifecyleByRegister() ||
        {};
  }

  if (isEmpty(lifecycle)) {
    console.error('[@ice/stark] microapp should export mount/unmout or register registerAppEnter/registerAppLeave.');
  }

  onFinishLoading(appConfig);

  return combineLifecyle(lifecycle, appConfig);
}

function capitalize(str: string) {
  if (typeof str !== 'string') return '';
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

async function callAppLifecycle(primaryKey: string, lifecycleKey: string, appConfig: AppConfig) {
  if (appConfig.appLifecycle && appConfig.appLifecycle[`${primaryKey}${capitalize(lifecycleKey)}`]) {
    await appConfig.appLifecycle[`${primaryKey}${capitalize(lifecycleKey)}`](appConfig);
  }
}

function combineLifecyle(lifecycle: ModuleLifeCycle, appConfig: AppConfig) {
  const combinedLifecyle = { ...lifecycle };
  ['mount', 'unmount', 'update'].forEach((lifecycleKey) => {
    if (lifecycle[lifecycleKey]) {
      combinedLifecyle[lifecycleKey] = async (props) => {
        await callAppLifecycle('before', lifecycleKey, appConfig);
        await lifecycle[lifecycleKey](props);
        await callAppLifecycle('after', lifecycleKey, appConfig);
      };
    }
  });
  return combinedLifecyle;
}

export function getAppConfigForLoad(app: string | AppConfig, options?: AppLifecylceOptions) {
  if (typeof app === 'string') {
    return getAppConfig(app);
  }
  const { name } = app;
  const appIndex = getAppNames().indexOf(name);
  if (appIndex === -1) {
    registerMicroApp(app, options);
  } else {
    updateAppConfig(name, app);
  }
  return getAppConfig(name);
}

export async function createMicroApp(app: string | AppConfig, appLifecyle?: AppLifecylceOptions, configuration?: StartConfiguration) {
  const appConfig = getAppConfigForLoad(app, appLifecyle);
  const appName = appConfig && appConfig.name;

  if (appConfig && appName) {
    // add configuration to every micro app
    const userConfiguration = globalConfiguration;
    Object.keys(configuration || {}).forEach((key) => {
      userConfiguration[key] = configuration[key];
    });
    updateAppConfig(appName, { configuration: userConfiguration });

    const { container, basename, activePath } = appConfig;

    if (container) {
      setCache('root', container);
    }

    const { basename: frameworkBasename } = userConfiguration;

    if (shouldSetBasename(activePath, basename)) {
      setCache('basename', getAppBasename(activePath, frameworkBasename, basename));
    }

    // check status of app
    if (appConfig.status === NOT_LOADED || appConfig.status === LOAD_ERROR) {
      if (appConfig.title) document.title = appConfig.title;
      updateAppConfig(appName, { status: LOADING_ASSETS });
      let lifeCycle: ModuleLifeCycle = {};
      try {
        lifeCycle = await loadAppModule(appConfig);
        // in case of app status modified by unload event
        if (getAppStatus(appName) === LOADING_ASSETS) {
          updateAppConfig(appName, { ...lifeCycle, status: NOT_MOUNTED });
        }
      } catch (err) {
        userConfiguration.onError(err);
        updateAppConfig(appName, { status: LOAD_ERROR });
      }
      if (lifeCycle.mount) {
        await mountMicroApp(appConfig.name);
      }
    } else if (appConfig.status === UNMOUNTED) {
      if (!appConfig.cached) {
        await loadAndAppendCssAssets(
          appConfig?.appAssets?.cssList || [],
          {
            cacheCss: !!((appConfig.loadScriptMode === 'fetch') || appConfig.sandbox || appConfig.umd),
            fetch: userConfiguration.fetch,
          },
        );
      }
      await mountMicroApp(appConfig.name);
    } else if (appConfig.status === NOT_MOUNTED) {
      await mountMicroApp(appConfig.name);
    } else {
      console.info(`[icestark] current status of app ${appName} is ${appConfig.status}`);
    }
    return getAppConfig(appName);
  } else {
    console.error(`[icestark] fail to get app config of ${appName}`);
  }
  return null;
}

export async function mountMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  // check current url before mount
  if (appConfig && appConfig.checkActive(window.location.href) && appConfig.status !== MOUNTED) {
    if (appConfig.mount) {
      await appConfig.mount({ container: appConfig.container, customProps: appConfig.props });
    }
    updateAppConfig(appName, { status: MOUNTED });
  }
}

export async function unmountMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  if (appConfig && (appConfig.status === MOUNTED || appConfig.status === LOADING_ASSETS || appConfig.status === NOT_MOUNTED)) {
    // remove assets if app is not cached
    const { shouldAssetsRemove } = getAppConfig(appName)?.configuration || globalConfiguration;
    const removedAssets = emptyAssets(shouldAssetsRemove, !appConfig.cached && appConfig.name);

    /**
    * Since es module natively imported twice may never excute twice. https://dmitripavlutin.com/javascript-module-import-twice/
    * Cache all child's removed assets, then append them when app is mounted for the second time.
    * Only cache removed assets when app's loadScriptMode is import which may not cause break change.
    */
    if (appConfig.loadScriptMode === 'import') {
      importCachedAssets[appName] = removedAssets;
    }

    updateAppConfig(appName, { status: UNMOUNTED });
    if (!appConfig.cached && appConfig.appSandbox) {
      appConfig.appSandbox.clear();
      appConfig.appSandbox = null;
    }
    if (appConfig.unmount) {
      await appConfig.unmount({ container: appConfig.container, customProps: appConfig.props });
    }
  }
}

// unload micro app, load app bundles when create micro app
export async function unloadMicroApp(appName: string) {
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

// remove app config from cache
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

export function removeMicroApps(appNames: string[]) {
  appNames.forEach((appName) => {
    removeMicroApp(appName);
  });
}

// clear all micro app configs
export function clearMicroApps() {
  getAppNames().forEach((name) => {
    unloadMicroApp(name);
  });
  microApps = [];
}
