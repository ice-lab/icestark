import Sandbox from '@ice/sandbox';
import { any2AnyArray } from './utils';
import { parseUrlAssets, appendCSS } from './modules';

export interface RuntimeInstance {
  id: string;
  // @Deprecated
  version?: string;
  url: string;
  strict?: boolean;
}

type CombineRuntime = Pick<RuntimeInstance, 'id' | 'version' | 'strict'> & { url?: string | string[] };

export type Runtime = boolean | string | RuntimeInstance[];

interface Json<T> {
  [id: string]: T;
}

const runtimeCache: Json<object> = {};

/**
 * excute one or multi runtime in serial.
 */
export function execute (codes: string | string[], deps: object, sandbox = new Sandbox({ multiMode: true }) as Sandbox) {

  sandbox.createProxySandbox(deps);

  any2AnyArray(codes).forEach(code => sandbox.execScriptInSandbox(code));

  const addedProperties = sandbox.getAddedProperties();
  sandbox.clear();
  return addedProperties;
}

export function createVersion (version: string, strict = false) {
  if (strict) {
    return version;
  }
  return version.split('.')[0];
}

export function createMark (runtime: CombineRuntime) {
  const { id, version, strict } = runtime;
  if (!version) {
    return id;
  }
  return `${id}@${createVersion(version, strict)}`;
}

/**
 * fetch, excute then cache runtime info.
 */
export async function cacheDeps (runtime: CombineRuntime, deps: object, fetch = window.fetch) {
  const { id, url } = runtime;
  const mark = createMark(runtime);


  if (runtimeCache[mark]) {
    return runtimeCache[mark];
  }

  const { cssList, jsList } = parseUrlAssets(url);

  // append css
  Promise.all(cssList.map((css: string) => appendCSS(`runtime-${id}`, css)));

  // execute in sandbox
  return runtimeCache[mark] = await Promise.all(
    jsList
      .map(
        u => fetch(u).then(res => res.text())
      )
  ).then(codes => execute(codes, deps));
}

export function fetchRuntimeJson (url: string, fetch = window.fetch) {
  if (!/.json/.test(url)) {
    console.warn('[icestark-module] runtime url should be a json file.');
  }
  return fetch(url).then(res => res.json());
}

export async function parseImmediately (runtimes: RuntimeInstance[], fetch = window.fetch) {
  return await runtimes.reduce(async (pre, next) => {
    const preProps = await pre;
    return {
      ...preProps,
      ...(await cacheDeps(next, preProps, fetch)),
    };
  }, Promise.resolve({}));
}

export async function parseRuntime (runtime: Runtime, fetch = window.fetch) {
  // if runtime is `undefined`/`false`
  if (!runtime) {
    return null;
  }

  /*
  * runtime info provided by url.
  */
  if (typeof runtime === 'string') {
    const runtimeConfigs = await fetchRuntimeJson(runtime, fetch);
    return parseImmediately(runtimeConfigs);
  }

  /*
  * runtime info provided in detail.
   */
  if (Array.isArray(runtime)) {
    return parseImmediately(runtime);
  }
}
