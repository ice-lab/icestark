import pathToRegexp from 'path-to-regexp';
import urlParse from 'url-parse';
import { ErrorCode, formatErrMessage } from './error';
import { isFunction, toArray, isObject, addLeadingSlash, log, isDev } from './helpers';

/**
 * "slash" - hashes like #/ and #/sunshine/lollipops
 * "noslash" - hashes like # and #sunshine/lollipops
 * "hashbang" - “ajax crawlable” (deprecated by Google) hashes like #!/ and #!/sunshine/lollipops
*/
export type HashType = 'hashbang' | 'noslash' | 'slash';

export interface PathOption {
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  hashType?: boolean | HashType;
}

export type PathData = PathOption & {
  value: string;
};

export interface ActiveFn {
  (url: string): boolean;
}

/**
 * Old logic, AppRoute's `path` only accept the follwing limited type.
 */
export type AppRoutePath = string | PathData | string[] | PathData[] | MixedPathData;

// export type MatchOptions = PathOptionWithHashType & {
//   pathData: PathData;
// };

export type MixedPathData = Array<string | PathData>;

/**
 * One can set activePath as follows:
 * case one: '/seller'
 * case two: ['/seller', '/waiter']
 * case three { value: '/seller', exact: true }
 * case four: [{ value: '/seller', exact: true }]
 * case five: [{ value: '/seller', exact: true }, '/waiter']
 * case six: (url) => url.includes('/seller')
 */
export type ActivePath = string | PathData | string[] | PathData[] | MixedPathData | ActiveFn;

/**
 * Used for formatting non-functional activePath to PathData and
 * merging outer PathOption to PathData.
 */
export const formatPath = (activePath?: ActivePath, options: PathOption = {}): PathData[] | ActiveFn => {
  if (!activePath) {
    return () => true;
  }

  if (isFunction(activePath)) {
    return activePath;
  }

  const string2ObjectPath = (pathData: string | PathData): PathData => {
    const objectPath = (isObject<object>(pathData)
      ? pathData
      : { value: pathData });

    return {
      ...objectPath,
      exact: objectPath.exact ?? options.exact,
      sensitive: objectPath.sensitive ?? options.sensitive,
      strict: objectPath.strict ?? options.strict,
      hashType: objectPath.hashType ?? options.hashType,
    };
  };
  return toArray(activePath).map(string2ObjectPath);
};

/**
 * Whether a given herf matchs activePath or not.
 * @param options
 * @param activePath
 * @returns
 */
const findActivePath = (activePath?: PathData[] | ActiveFn): (url?: string) => string | boolean => {
  // Always activate app when activePath is not specified.
  if (!activePath) {
    return () => true;
  }

  // If pass fucntion to activePath, just returns
  if (isFunction(activePath)) {
    return (url: string) => activePath(url);
  }

  return (url: string) => {
    // Record matched index
    let matchedPath;
    const isActive = activePath.some((path) => {
      matchedPath = path?.value;

      if (!matchedPath && isDev) {
        log.warn(
          formatErrMessage(
            ErrorCode.ACTIVE_PATH_ITEM_CAN_NOT_BE_EMPTY,
            `Each item of activePath must be string、object、array or a function. Received ${matchedPath?.toString()}`,
          ),
        );
      }

      // Escape when path is empty or undefined
      return matchedPath ? matchPath(url, path) : false;
    });

    return isActive ? matchedPath : false;
  };
};

export type FindActivePathReturn = ReturnType<typeof findActivePath>;

export default findActivePath;

const HashPathDecoders = {
  hashbang: (path: string) => (path.charAt(0) === '!' ? path.substr(1) : path),
  noslash: addLeadingSlash,
  slash: addLeadingSlash,
};

function getHashPath(hash = '/'): string {
  const hashIndex = hash.indexOf('#');
  const hashPath = hashIndex === -1 ? hash : hash.substr(hashIndex + 1);

  // remove hash query
  const searchIndex = hashPath.indexOf('?');
  return searchIndex === -1 ? hashPath : hashPath.substr(0, searchIndex);
}

/**
 * Api for turning hash to pathname. Like `/seller#homepage` turns to `/homepage`.
 * HashType only exists in outer setting scope which may not act as a path option.
 */
export function getPathname(url: string, hashType?: boolean | HashType) {
  const { pathname, hash } = urlParse(url, true);

  return hashType
    ? HashPathDecoders[hashType === true ? 'slash' : hashType](getHashPath(hash))
    : pathname;
}

/**
 * Use path-to-regexp to get the matching RegExpression
 */
function genPath2RegExp(path: string, regExpOptions: pathToRegexp.RegExpOptions) {
  const keys = [];
  const regexp = pathToRegexp(path, keys, regExpOptions);
  return { regexp, keys };
}

/**
 * Api for matching URL's pathname to path.
 * @returns false | {
 *  path: PathData.value
 *  url: matched path
 *  isExact:
 *  params: href params
 * }
 */
export function matchPath(href: string, options: PathData) {
  const { value, hashType, exact = false, strict = false, sensitive = false } = options;

  const pathname = getPathname(href, hashType);

  const { regexp, keys } = genPath2RegExp(value, {
    strict,
    sensitive,
    end: exact,
  });

  const match = regexp.exec(pathname);

  if (!match) {
    return false;
  }

  const [url, ...values] = match;
  const isExact = pathname === url;

  if (exact && !isExact) return false;

  return {
    path: value,
    url: value === '/' && url === '' ? '/' : url,
    isExact,
    params: keys.reduce((memo, key, index) => {
      memo[key.name] = values[index];
      return memo;
    }, {}),
  };
}
