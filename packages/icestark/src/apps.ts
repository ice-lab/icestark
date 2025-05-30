import Sandbox, { SandboxConstructor, SandboxProps } from '@ice/sandbox';
import isEmpty from 'lodash.isempty';
import { NOT_LOADED, NOT_MOUNTED, LOADING_ASSETS, UNMOUNTED, LOAD_ERROR, MOUNTED, IS_CSS_REGEX } from './util/constant';
import findActivePathCurry, { ActivePath, PathOption, formatPath } from './util/checkActive';
import {
  createSandbox,
  getUrlAssets,
  getEntryAssets,
  loadAndAppendCssAssets,
  loadAndAppendJsAssets,
  emptyAssets,
  filterRemovedAssets,
  Assets,
  AssetTypeEnum,
} from './util/handleAssets';
import { setCache } from './util/cache';
import { loadScriptByFetch, loadScriptByImport } from './util/loaders';
import { getLifecyleByLibrary, getLifecyleByRegister } from './util/getLifecycle';
import { mergeFrameworkBaseToPath, getAppBasename, shouldSetBasename, log, isDev } from './util/helpers';
import { ErrorCode, formatErrMessage } from './util/error';
import globalConfiguration, { temporaryState } from './util/globalConfiguration';

import type { StartConfiguration } from './util/globalConfiguration';
import type { FindActivePathReturn } from './util/checkActive';

export type ScriptAttributes = string[] | ((url: string) => string[]);

const importCachedAssets: {
  [index: string]: HTMLElement[];
} = {};

interface LifecycleProps {
  container: HTMLElement | string;
  customProps?: object;
}

type LoadScriptMode = 'fetch' | 'script' | 'import';

export interface ModuleLifeCycle {
  mount?: (props: LifecycleProps) => Promise<void> | void;
  unmount?: (props: LifecycleProps) => Promise<void> | void;
  update?: (props: LifecycleProps) => Promise<void> | void;
  bootstrap?: (props: LifecycleProps) => Promise<void> | void;
}

export interface RuntimeConfig {
  url: string | string[];
  library: string;
  version: string;
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
  runtime?: RuntimeConfig[];
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
  loadScriptMode?: LoadScriptMode;
  /**
   * @private will be prefixed with `_` for it is internal.
   */
  findActivePath?: FindActivePathReturn;
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

  const findActivePath = findActivePathCurry(mergeFrameworkBaseToPath(activePathArray, frameworkBasename));

  const microApp = {
    status: NOT_LOADED,
    ...appConfig,
    appLifecycle: appLifecyle,
    findActivePath,
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

/**
 * Core logic to load micro apps
 * @param appConfig
 * @returns
 */
export async function loadAppModule(appConfig: AppConfig) {
  const { onLoadingApp, onFinishLoading, fetch } = getAppConfig(appConfig.name)?.configuration || globalConfiguration;

  let lifecycle: ModuleLifeCycle = {};
  onLoadingApp(appConfig);
  const { url, container, entry, entryContent, name, scriptAttributes = [], loadScriptMode, appSandbox, runtime } = appConfig;
  const appAssets = url ? getUrlAssets(url) : await getEntryAssets({
    root: container,
    entry,
    href: location.href,
    entryContent,
    assetsCacheKey: name,
    fetch,
  });

  updateAppConfig(appConfig.name, { appAssets });

  const cacheCss = shouldCacheCss(loadScriptMode);

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
    case 'fetch': {
      const runtimeCssList = [];
      const runtimeJsList = [];
      // Filter and map runtime libraries that haven't been registered in window
      const runtimeLibs = runtime?.filter((config) => {
        return config.version && config.library;
      }).map((config) => {
        // Handle both string and array URL formats
        const urls = Array.isArray(config.url) ? config.url : [config.url];
        // Separate CSS and JS URLs
        const jsUrls = [];
        urls.forEach((configUrl) => {
          if (IS_CSS_REGEX.test(configUrl)) {
            runtimeCssList.push({
              content: configUrl,
              type: AssetTypeEnum.EXTERNAL,
            });
          } else {
            jsUrls.push(configUrl);
          }
        });
        if (jsUrls.length === 0) {
          return null;
        }
        // Use the last JS URL as the main runtime JS
        const mainJs = jsUrls[jsUrls.length - 1];
        const restJs = jsUrls.slice(0, -1);
        restJs.forEach((configUrl) => {
          runtimeJsList.push({
            content: configUrl,
            type: AssetTypeEnum.EXTERNAL,
          });
        });

        return {
          content: mainJs,
          type: AssetTypeEnum.RUNTIME,
          loaded: Boolean(config.version && config.library && window[`${config.library}@${config.version}`]),
          library: config.library,
          version: config.version,
        };
      }).filter(Boolean) || [];

      await loadAndAppendCssAssets([
        ...runtimeCssList,
        ...appAssets.cssList,
      ], {
        cacheCss,
        fetch,
      });

      lifecycle = await loadScriptByFetch([
        ...runtimeJsList,
        ...runtimeLibs,
        ...appAssets.jsList,
      ], appSandbox, fetch);
      break;
    }
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
    log.error(
      formatErrMessage(
        ErrorCode.EMPTY_LIFECYCLES,
        isDev && 'Unable to retrieve lifecycles of {0} after loading it',
        appConfig.name,
      ),
    );
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

function shouldCacheCss(mode: LoadScriptMode) {
  return temporaryState.shouldAssetsRemoveConfigured ? false : (mode !== 'script');
}

function registerAppBeforeLoad(app: AppConfig, options?: AppLifecylceOptions) {
  const { name } = app;
  const appIndex = getAppNames().indexOf(name);

  if (appIndex === -1) {
    registerMicroApp(app, options);
  } else {
    updateAppConfig(name, app);
  }

  return getAppConfig(name);
}

async function loadApp(app: MicroApp) {
  const { title, name, configuration } = app;

  if (title) {
    document.title = title;
  }

  updateAppConfig(name, { status: LOADING_ASSETS });

  let lifeCycle: ModuleLifeCycle = {};
  try {
    lifeCycle = await loadAppModule(app);
    // in case of app status modified by unload event
    if (getAppStatus(name) === LOADING_ASSETS) {
      updateAppConfig(name, { ...lifeCycle, status: NOT_MOUNTED });
    }
  } catch (err) {
    configuration.onError(err);
    log.error(err);
    updateAppConfig(name, { status: LOAD_ERROR });
  }
  if (lifeCycle.mount) {
    await mountMicroApp(name);
  }
}

function mergeThenUpdateAppConfig(name: string, configuration?: StartConfiguration) {
  const appConfig = getAppConfig(name);

  if (!appConfig) {
    return;
  }

  const { umd, sandbox, runtime } = appConfig;

  // Generate appSandbox
  const appSandbox = createSandbox(sandbox) as Sandbox;

  // Merge loadScriptMode
  const sandboxEnabled = sandbox && !appSandbox.sandboxDisabled;
  const loadScriptMode = appConfig.loadScriptMode ?? (umd || sandboxEnabled || (runtime && runtime.length > 0) ? 'fetch' : 'script');

  // Merge global configuration
  const cfgs = {
    ...globalConfiguration,
    ...configuration,
  };

  updateAppConfig(name, {
    appSandbox,
    loadScriptMode,
    configuration: cfgs,
  });
}

export async function createMicroApp(
  app: string | AppConfig,
  appLifecyle?: AppLifecylceOptions,
  configuration?: StartConfiguration,
) {
  const appName = typeof app === 'string' ? app : app.name;

  if (typeof app !== 'string') {
    registerAppBeforeLoad(app, appLifecyle);
  }

  mergeThenUpdateAppConfig(appName, configuration);

  const appConfig = getAppConfig(appName);

  if (!appConfig || !appName) {
    console.error(`[icestark] fail to get app config of ${appName}`);
    return null;
  }

  const { container, basename, activePath, configuration: userConfiguration, findActivePath } = appConfig;

  if (container) {
    setCache('root', container);
  }

  const { fetch } = userConfiguration;

  if (shouldSetBasename(activePath, basename)) {
    let pathString = findActivePath(window.location.href);

    // When use `createMicroApp` lonely, `activePath` maybe not provided.
    pathString = typeof pathString === 'string' ? pathString : '';
    setCache('basename', getAppBasename(pathString, basename));
  }

  switch (appConfig.status) {
    case NOT_LOADED:
    case LOAD_ERROR:
      await loadApp(appConfig);
      break;
    case UNMOUNTED:
      if (!appConfig.cached) {
        const appendAssets = [
          ...(appConfig?.appAssets?.cssList || []),
          // In vite development mode, styles are inserted into DOM manually.
          // While es module natively imported twice may never excute twice.
          // https://github.com/ice-lab/icestark/issues/555
          ...(appConfig?.loadScriptMode === 'import' ? filterRemovedAssets(importCachedAssets[appConfig.name] ?? [], ['LINK', 'STYLE']) : []),
        ];

        await loadAndAppendCssAssets(appendAssets, {
          cacheCss: shouldCacheCss(appConfig.loadScriptMode),
          fetch,
        });
      }
      await mountMicroApp(appConfig.name);
      break;
    case NOT_MOUNTED:
      await mountMicroApp(appConfig.name);
      break;
    default:
      break;
  }

  return getAppConfig(appName);
}

export async function mountMicroApp(appName: string) {
  const appConfig = getAppConfig(appName);
  // check current url before mount
  const shouldMount = appConfig?.mount && appConfig?.findActivePath(window.location.href);

  if (shouldMount) {
    if (appConfig?.mount) {
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
    log.error(
      formatErrMessage(
        ErrorCode.CANNOT_FIND_APP,
        isDev && 'Can not find app {0} when call {1}',
        appName,
        'unloadMicroApp',
      ),
    );
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
    log.error(
      formatErrMessage(
        ErrorCode.CANNOT_FIND_APP,
        isDev && 'Can not find app {0} when call {1}',
        appName,
        'removeMicroApp',
      ),
    );
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
