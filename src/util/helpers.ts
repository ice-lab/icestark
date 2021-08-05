import { setCache } from './cache';
import type { PathData, AppRoutePath } from './checkActive';

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
* It's difficult to dig out the actual path url, so comes the
* following function.
 */
export const getActualUrlFromPath = (path: AppRoutePath): string => {
  if (Array.isArray(path)) {
    return addLeadingSlash(typeof path[0] === 'string' ? path[0] : path[0].value);
  }
  if (isObject<PathData>(path)) {
    return path.value;
  }
  return addLeadingSlash(path);
};

/**
 * Set basename for micro apps to use handily.
 * A properly formatted basename has a leading slash, but not trailing slash.
 */
export const setBasenameCache = (path: AppRoutePath = '', frameworkBase?: string, appBase?: string): void => {
  const actualPath = getActualUrlFromPath(path);

  const leadingSlashFrameworkBase = frameworkBase ? addLeadingSlash(frameworkBase) : '';
  const leadingSlashAppBase = appBase ? addLeadingSlash(appBase) : '';
  setCache('basename', `${leadingSlashFrameworkBase}${leadingSlashAppBase || actualPath}`);
};

