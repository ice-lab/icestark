import * as urlParse from 'url-parse';
import matchPath from './util/matchPath';

interface ActiveFn {
  (url: string): boolean;
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
}

// cache all microApp
const microApps = [];

function getAppNames() {
  return microApps.map((app) => app.name);
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
    status: '',
    ...appConfig,
    activeRules,
  };
  microApps.push(microApp);
}

export function removeMicroApp(appName) {
  const appIndex = getAppNames().indexOf(appName);
  microApps.splice(appIndex, 1);
}

export function loadMicroApp() {
  console.log('loadMicroApp');
}

export function unloadMicroApp() {
  console.log('unloadMicroApp');
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
  hashbang: path => (path.charAt(0) === '!' ? path.substr(1) : path),
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
    if (activeRules.some((activeRule) => activeRule(url))) {
      activeApps.push(microApp);
    }
  });
  return activeApps;
}
