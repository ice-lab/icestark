import type { PathData, AppRoutePath, ActiveFn, ActivePath, FindActivePathReturn } from './checkActive';

export const isDev = process.env.NODE_ENV === 'development';

export const toArray = <T>(any: T | T[]): T[] => {
  return Array.isArray(any) ? any : [any];
};

export const formatMessage = (msg: string): string => {
  return `[icestark]: ${msg}`;
};

/**
* all built in <script /> attributes
* referring to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
*/
export const builtInScriptAttributesMap = new Map<string, string>([
  // eslint-disable-next-line max-len
  ...['async', 'defer', 'integrity', 'nonce', 'referrerpolicy', 'src', 'type', 'autocapitalize', 'dir', 'draggable', 'hidden', 'id', 'lang', 'part', 'slot', 'spellcheck', 'style', 'title', 'translate']
    .map((item) => ([item, item]) as [string, string]),
  ['crossorigin', 'crossOrigin'],
  ['nomodule', 'noModule'],
  ['contenteditable', 'contentEditable'],
  ['inputmode', 'inputMode'], ['tabindex', 'tabIndex'],
]);

export const looseBoolean2Boolean = (falsyBoolean: 'true' | 'false' | unknown): boolean | unknown => {
  if (falsyBoolean === 'false' || falsyBoolean === 'true') {
    return falsyBoolean !== 'false';
  }
  return falsyBoolean;
};

type AllTypes =
  | 'Number'
  | 'Object'
  | 'BigInt'
  | 'Boolean'
  | 'Undefined'
  | 'Null'
  | 'Array'
  | 'Symbol'
  | 'Math'
  | 'JSON'
  | 'Date'
  | 'RegExp'
  | 'Error'
  | 'Window'
  | 'HTMLDocument';

export const checkTypes = (type: AllTypes) => <T>(value: unknown): value is T => Object.prototype.toString.call(value).slice(8, -1) === type;

/**
 * Checks if value is classified as a Function object.
 */
export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
};

/**
 * Checks if value is a plain object.
 */
export const isObject = checkTypes('Object');

/**
 * Checks if value is underfined.
 */
export const isUndefined = checkTypes('Undefined');

/**
* Checks if value is an element
*/
export const isElement = (element: unknown): element is HTMLElement => {
  return element instanceof Element || element instanceof HTMLDocument;
};

/**
 * convert path to unique string.
 */
export const converArray2String = (list: string | object | string[] | object[]): string => {
  if (Array.isArray(list)) {
    return (list).map((item: string | object) => {
      if (isObject(item)) {
        return Object.keys(item).map((key) => `${key}:${item[key]}`).join(',');
      }
      return item;
    }).join(',');
  }
  if (isObject(list)) {
    return Object.keys(list).map((key) => `${key}:${list[key]}`).join(',');
  }
  return String(list);
};

export function addLeadingSlash(path: string): string {
  return path.charAt(0) === '/' ? path : `/${path}`;
}

/**
 * Get basename for micro apps to use handily.
 * A properly formatted basename has a leading slash, but not trailing slash.
 */
export const getAppBasename = (path = '', appBase?: string): string => {
  const actualPath = addLeadingSlash(path);

  const leadingSlashAppBase = appBase && addLeadingSlash(appBase);

  /**
  * It's preferable to use `??` bewteen leadingSlashAppBase and actualPath. But some
  * users already use the misunderstanding `basename=''`, which we have to keep things the way they are.
   */
  return `${leadingSlashAppBase || actualPath}`;
};

/**
 * Sometime layout application hosts under certain basename. So frameworkBasename is supported on globalConfiguration
 * and will merge to activePath in advance.
 */
export const mergeFrameworkBaseToPath = (path: PathData[] | ActiveFn, frameworkBase?: string) => {
  if (frameworkBase && !isFunction(path)) {
    return path.map((pathStr) => ({
      ...pathStr,
      value: `${addLeadingSlash(frameworkBase)}${pathStr.value || pathStr}`,
    }));
  }
  return path;
};

/**
 * Check basename should set or not. Especially, one may use `createMicroApp` without `activePath` and
 * `basename` setting.
 */
export const shouldSetBasename = (activePath?: ActivePath, basenmae?: string): activePath is AppRoutePath => {
  if (isFunction(activePath)) {
    return false;
  }

  if (isUndefined(activePath) && isUndefined(basenmae)) {
    return false;
  }

  return true;
};

/**
 * Turns concurrent traversing to sequential travsersing.
 */
export const asyncForEach = async <T> (arr: T[], callback: (item: T, index: number) => Promise<void>): Promise<void> => {
  for (let idx = 0; idx < arr.length; ++idx) {
    // All async promises run sequentially. So disable the following lint.
    // eslint-disable-next-line no-await-in-loop
    await callback(arr[idx], idx);
  }
};

export const log = {
  info: console.log,
  error: console.error,
  warn: console.warn,
};
