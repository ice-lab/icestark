import Sandbox from '@ice/sandbox';
import { any2AnyArray } from './utils';
import { parseUrlAssets, appendCSS } from './modules';

const VERSION_REG = /^\d+$|^\d+(\.\d+){1,2}$/;

export interface RuntimeInstance {
  id: string;
  version?: string;
  url?: string;
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

  console.log('deps----', deps);
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

/**
 * fetch, excute then cache runtime info.
 */
export async function cache (runtime: CombineRuntime, deps: object, fetch = window.fetch) {
  const { id, url, version, strict } = runtime;
  const mark = `${id}@${createVersion(version, strict)}`;

  // FIXME: 需要根据不同的策略调整
  // 1. 如果 version 没有提供 2. 如果开启 strict 模式
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

/**
 * runtime `react-dom` depends on `react`.
 */
export function combineReact (runtimes: RuntimeInstance[]): CombineRuntime[] {
  const getIdx = (id: string) => runtimes.findIndex((runtime => runtime.id === id));
  const has = (id: string) => getIdx(id) > -1;

  if (has('react') && has('react-dom')) {
    const idxReact = getIdx('react');
    const idxReactDom = getIdx('react-dom');

    return [
      ...runtimes.slice(0, idxReact),
      {
        id: 'react-bundle',
        version: runtimes[idxReact].version,
        url: [runtimes[idxReact].url].concat(runtimes[idxReactDom].url),
      },
      ...runtimes.slice(idxReact + 1, idxReactDom),
      ...runtimes.slice(idxReactDom + 1),
    ];
  }
  return runtimes;
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
      ...(await cache(next, preProps, fetch)),
    }
    ;
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
