/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/camelcase */
type Scope = unknown;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Factory = () => any;

interface Json<T> {
  [index: string]: T;
}

export interface ModuleOptions {
  entry: string;
  app: string;
  module: string;
};

interface Container {
  init(shareScope: Scope): void;
  get(module: string): Factory;
};

declare const __webpack_init_sharing__: (shareScope: Scope) => Promise<void>;
declare const __webpack_share_scopes__: { default: Scope };

const entryMap: Json<boolean> = {};

/**
 *
 * used for load remote entry.
 */
function loadEntry (entry: string, root = document.body): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (entryMap[entry]) {
      resolve();
      return;
    }

    const element: HTMLScriptElement = document.createElement('script');

    element.setAttribute('icestark', 'dynamic');
    element.type = 'text/javascript';
    element.src = entry;
    element.async = false;

    element.onerror = () => {
      reject(new Error(`remote entry loaded error: ${entry}`));
    };

    element.onload = () => {
      entryMap[entry] = true;
      resolve();
    };

    root.append(element);
  });
}

/**
 * lookup remote module
 */
async function loadFederatedModule (app: string, module: string, shareScope: Scope = 'default') {
  // initializes the share scope.
  await __webpack_init_sharing__(shareScope);

  // get the container from `window`.
  const container = window[app] as Container;

  // 
  await container.init(__webpack_share_scopes__.default);

  const factory = await container.get(module);
  const Module = factory();
  return Module;
}

export function loadModule(options: ModuleOptions): Promise<void> {
  const { app, module, entry } = options;
  // FIXME: should cache modules already loaded

  return loadEntry(entry)
    .then(() => loadFederatedModule(app, module));
}
