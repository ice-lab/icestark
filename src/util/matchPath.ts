import * as pathToRegexp from 'path-to-regexp';
import * as urlParse from 'url-parse';

interface MatchOptions {
  path?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  hashType?: boolean;
}

interface MatchResult {
  regexp?: pathToRegexp.PathRegExp;
  keys?: string[];
}

const cache: {[key: string]: MatchResult} = {};
const cacheLimit = 10000;
let cacheCount = 0;

function compilePath(path, options) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) return pathCache[path];

  const keys = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
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

export function matchActivePath(url: string, pathInfo: MatchOptions) {
  const { pathname, hash } = urlParse(url, true);
  const { hashType } = pathInfo;
  let checkPath = pathname;
  if (hashType) {
    const decodePath = HashPathDecoders[hashType === true ? 'slash' : hashType];
    checkPath = decodePath(getHashPath(hash));
  }
  return matchPath(checkPath, pathInfo);
}


/**
 * Public API for matching a URL pathname to a path.
 */
export default function matchPath(pathname: string, options: MatchOptions = {}) {
  let matchOptions = options;
  if (typeof options === 'string') matchOptions = { path: options };

  const { exact = false, strict = false, sensitive = false } = matchOptions;

  const paths = [].concat(matchOptions.path);

  return paths.reduce((matched, path) => {
    if (!path) return null;
    if (matched) return matched;
    const { value, ...restOptions } = Object.prototype.toString.call(path) === '[object Object]'
      ? path
      : ({} as unknown);
    const pathValue = value || path;
    const pathOptions = {
      end: exact,
      strict,
      sensitive,
      ...restOptions,
    };
    if (pathOptions.exact) {
      // overwrite exact value to end
      pathOptions.end = pathOptions.exact;
      delete pathOptions.exact;
    }
    const { regexp, keys } = compilePath(pathValue, pathOptions);
    const match = regexp.exec(pathname);

    if (!match) return null;

    const [url, ...values] = match;
    const isExact = pathname === url;

    if (exact && !isExact) return null;

    return {
      path: pathValue, // the path used to match
      url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {}),
    };
  }, null);
}
