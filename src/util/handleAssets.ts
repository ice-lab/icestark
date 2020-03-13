import { PREFIX, DYNAMIC, STATIC, IS_CSS_REGEX } from './constant';
import { getCache } from './cache';
import { warn, error } from './message';

const getCacheRoot = () => getCache('root');

const winFetch = window.fetch;
const COMMENT_REGEX = /<!--.*?-->/g;
const SCRIPT_REGEX = /<script\b[^>]*>([^<]*)<\/script>/gi;
const SCRIPT_SRC_REGEX = /<script\b[^>]*src=['"]?([^'"]*)['"]?\b[^>]*>/gi;
const STYLE_REGEX = /<style\b[^>]*>([^<]*)<\/style>/gi;
const LINK_HREF_REGEX = /<link\b[^>]*href=['"]?([^'"]*)['"]?\b[^>]*>/gi;
const CSS_REGEX = new RegExp([STYLE_REGEX, LINK_HREF_REGEX].map((reg) => reg.source).join('|'), 'gi');
const STYLE_SHEET_REGEX = /rel=['"]stylesheet['"]/gi;

export enum AssetTypeEnum {
  INLINE = 'inline',
  EXTERNAL = 'external',
}

export enum AssetCommentEnum {
  REPLACED = 'replaced',
  PROCESSED = 'processed',
}

export interface Asset {
  type: AssetTypeEnum;
  content: string;
}

export interface ProcessedContent {
  html: string;
  assets: {
    jsList: Asset[];
    cssList: Asset[];
  };
}

export interface ParsedConfig {
  origin: string;
  pathname: string;
}

/**
 * Create link/style element and append to root
 */
export function appendCSS(
  root: HTMLElement | ShadowRoot,
  asset: string | Asset,
  id: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const { type, content } = (asset as Asset);
    if (!root) reject(new Error(`no root element for css assert: ${content || asset}`));

    if (type && type === AssetTypeEnum.INLINE) {
      const styleElement: HTMLStyleElement = document.createElement('style');
      styleElement.innerHTML = content;
      root.appendChild(styleElement);
      resolve();
      return;
    }

    const element: HTMLLinkElement = document.createElement('link');
    element.setAttribute(PREFIX, DYNAMIC);
    element.id = id;
    element.rel = 'stylesheet';
    element.href = content || (asset as string);

    element.addEventListener(
      'error',
      () => {
        error(`css asset loaded error: ${asset}`);
        return resolve();
      },
      false,
    );
    element.addEventListener('load', () => resolve(), false);

    root.appendChild(element);
  });
}

/**
 * Create script element (without inline) and append to root
 */
export function appendExternalScript(
  root: HTMLElement | ShadowRoot,
  asset: string | Asset,
  id: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const { type, content } = (asset as Asset);
    if (!root) reject(new Error(`no root element for js assert: ${content || asset}`));

    const element: HTMLScriptElement = document.createElement('script');
    // inline script    
    if (type && type  === AssetTypeEnum.INLINE) {
      element.innerHTML = content;
      root.appendChild(element);
      resolve();
      return;
    }
    element.setAttribute(PREFIX, DYNAMIC);
    element.id = id;
    element.type = 'text/javascript';
    element.src = content || (asset as string);
    element.async = false;

    element.addEventListener(
      'error',
      () => reject(new Error(`js asset loaded error: ${asset}`)),
      false,
    );
    element.addEventListener('load', () => resolve(), false);

    root.appendChild(element);
  });
}

export function appendAllLink(
  root: HTMLElement | ShadowRoot,
  urlList: string[],
): Promise<string[]> {
  return Promise.all(
    urlList.map((cssUrl, index) => appendCSS(root, cssUrl, `${PREFIX}-css-${index}`)),
  );
}

export function appendAllScriptWithOutInline(
  root: HTMLElement | ShadowRoot,
  urlList: string[],
): Promise<string[]> {
  return Promise.all(
    urlList.map((jsUrl, index) => appendExternalScript(root, jsUrl, `${PREFIX}-js-${index}`)),
  );
}

export async function appendAssets(assetsList: string[], useShadow: boolean) {
  const jsRoot: HTMLElement = document.getElementsByTagName('head')[0];
  const cssRoot: HTMLElement | ShadowRoot = useShadow
    ? getCacheRoot()
    : document.getElementsByTagName('head')[0];

  const jsList: string[] = [];
  const cssList: string[] = [];

  assetsList.forEach(url => {
    // //icestark.com/index.css -> true
    // //icestark.com/index.css?timeSamp=1575443657834 -> true
    // //icestark.com/index.css?query=test.js -> false
    const isCss: boolean = IS_CSS_REGEX.test(url);
    if (isCss) {
      cssList.push(url);
    } else {
      jsList.push(url);
    }
  });

  if (useShadow) {
    // make sure css loads after all js have been loaded under shadowRoot
    await appendAllScriptWithOutInline(jsRoot, jsList);
    await appendAllLink(cssRoot, cssList);
  } else {
    await appendAllLink(cssRoot, cssList);
    await appendAllScriptWithOutInline(jsRoot, jsList);
  }
}

export function parseUrl(entry: string): ParsedConfig {
  const a = document.createElement('a');
  a.href = entry;

  return {
    origin: a.origin,
    pathname: a.pathname,
  };
}

export function startWith(url: string, prefix: string): boolean {
  return url.slice(0, prefix.length) === prefix;
}

export function getUrl(entry: string, relativePath: string): string {
  const { origin, pathname } = parseUrl(entry);

  // https://icestark.com/ice/index.html + ./js/index.js -> https://icestark.com/ice/js/index.js
  if (startWith(relativePath, './')) {
    const rPath = relativePath.slice(1);

    if (!pathname || pathname === '/') {
      return `${origin}${rPath}`;
    }

    const pathArr = pathname.split('/');
    pathArr.splice(-1);
    return `${origin}${pathArr.join('/')}${rPath}`;
  } else if (startWith(relativePath, '/')) {
    // https://icestark.com/ice/index.html + /js/index.js -> https://icestark.com/js/index.js
    return `${origin}${relativePath}`;
  } else {
    // https://icestark.com + js/index.js -> https://icestark.com/js/index.js
    return `${origin}/${relativePath}`;
  }
}

/**
 * If script/link processed by @ice/stark, add comment for it
 */
export function getComment(tag: string, from: string, type: AssetCommentEnum): string {
  return `<!--${tag} ${from} ${type} by @ice/stark-->`;
}

/**
 * html -> { html: processedHtml, assets: processedAssets }
 */
export function processHtml(html: string, entry?: string): ProcessedContent {
  if (!html) return { html: '', assets: { cssList:[], jsList: []} };

  const processedJSAssets = [];
  const processedCSSAssets = [];
  const processedHtml = html
    .replace(COMMENT_REGEX, '')
    .replace(SCRIPT_REGEX, (...args) => {
      const [matchStr, matchContent] = args;
      if (!matchStr.match(SCRIPT_SRC_REGEX)) {
        processedJSAssets.push({
          type: AssetTypeEnum.INLINE,
          content: matchContent,
        });

        return getComment('script', 'inline', AssetCommentEnum.REPLACED);
      } else {
        return matchStr.replace(SCRIPT_SRC_REGEX, (_, argSrc2) => {
          const url = argSrc2.indexOf('//') >= 0 ? argSrc2 : getUrl(entry, argSrc2);
          processedJSAssets.push({
            type: AssetTypeEnum.EXTERNAL,
            content: url,
          });

          return getComment('script', argSrc2, AssetCommentEnum.REPLACED);
        });
      }
    })
    .replace(CSS_REGEX, (...args) => {
      const [matchStr, matchStyle, matchLink] = args;
      // not stylesheet, return as it is
      if (matchStr.match(STYLE_SHEET_REGEX)) {
        const url = matchLink.indexOf('//') >= 0 ? matchLink : getUrl(entry, matchLink);
        processedCSSAssets.push({
          type: AssetTypeEnum.EXTERNAL,
          content: url,
        });
        return `${getComment('link', matchLink, AssetCommentEnum.PROCESSED)}`;
      } else if (matchStyle){
        processedCSSAssets.push({
          type: AssetTypeEnum.INLINE,
          content: matchStyle,
        });
        return getComment('style', 'inline', AssetCommentEnum.REPLACED);
      }
      return matchStr;
    });
  return {
    html: processedHtml,
    assets: {
      jsList: processedJSAssets,
      cssList: processedCSSAssets,
    },
  };
}

export async function appendProcessedContent(
  root: HTMLElement | ShadowRoot,
  processedContent: ProcessedContent,
) {
  const { html: processedHtml, assets: { jsList, cssList} } = processedContent;
  root.innerHTML = processedHtml;
  
  const assetsRoot: HTMLElement = document.getElementsByTagName('head')[0];
  await Promise.all([
    // load css source
    ...(cssList.map((cssAssets, index) => {
      return appendCSS(assetsRoot, cssAssets, `${PREFIX}-css-${index}`);
    })),
  ]);
  // make sure js assets loaded in order
  await jsList.reduce((chain, asset, index) => {
    return chain.then(() => appendExternalScript(assetsRoot, asset, `${PREFIX}-js-${index}`));
  }, Promise.resolve());
}

const cachedProcessedContent: object = {};

export async function loadEntry(
  root: HTMLElement | ShadowRoot,
  entry: string,
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> = winFetch,
) {
  if (cachedProcessedContent[entry]) {
    await appendProcessedContent(root, cachedProcessedContent[entry]);
    return;
  }

  if (!fetch) {
    warn('Current environment does not support window.fetch, please use custom fetch');
    throw new Error(
      `fetch ${entry} error: Current environment does not support window.fetch, please use custom fetch`,
    );
  }

  const res = await fetch(entry);
  const html = await res.text();

  cachedProcessedContent[entry] = processHtml(html, entry);
  await appendProcessedContent(root, cachedProcessedContent[entry]);
}

export async function loadEntryContent(
  root: HTMLElement | ShadowRoot,
  entryContent: string,
  href: string,
  cachedKey: string,
) {
  if (!cachedProcessedContent[cachedKey]) {
    cachedProcessedContent[cachedKey] = processHtml(entryContent, href);
  }
  await appendProcessedContent(root, cachedProcessedContent[cachedKey]);
}

export function getAssetsNode(): (HTMLStyleElement|HTMLScriptElement)[] {
  let nodeList = [];
  ['style', 'link', 'script'].forEach((tagName) => {
    nodeList = [...nodeList, ...Array.from(document.getElementsByTagName(tagName))];
  });
  return nodeList;
}

/**
 * Record static assets
 */
export function recordAssets(): void {
  // getElementsByTagName is faster than querySelectorAll
  const assetsList = getAssetsNode();
  assetsList.forEach((assetsNode) => {
    setStaticAttribute(assetsNode);
  });
}

/**
 * If `PREFIX` is setted in `DYNAMIC` type, remain it
 */
export function setStaticAttribute(tag: HTMLStyleElement | HTMLScriptElement): void {
  if (tag.getAttribute(PREFIX) !== DYNAMIC) {
    tag.setAttribute(PREFIX, STATIC);
  }
  tag = null;
}

/**
 * Empty useless assets
 */
export function emptyAssets(
  shouldRemove: (
    assetUrl: string,
    element?: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement,
  ) => boolean,
  cacheKey: string|boolean,
): void {
  // remove extra assets
  const styleList: NodeListOf<HTMLElement> = document.querySelectorAll(
    `style:not([${PREFIX}=${STATIC}])`,
  );
  styleList.forEach(style => {
    if (shouldRemove(null, style) && checkCacheKey(style, cacheKey)) {
      style.parentNode.removeChild(style);
    }
  });

  const linkList: NodeListOf<HTMLElement> = document.querySelectorAll(
    `link:not([${PREFIX}=${STATIC}])`,
  );
  linkList.forEach(link => {
    if (shouldRemove(link.getAttribute('href'), link) && checkCacheKey(link, cacheKey)) {
      link.parentNode.removeChild(link);
    }
  });

  const jsExtraList: NodeListOf<HTMLElement> = document.querySelectorAll(
    `script:not([${PREFIX}=${STATIC}])`,
  );
  jsExtraList.forEach(js => {
    if (shouldRemove(js.getAttribute('src'), js) && checkCacheKey(js, cacheKey)) {
      js.parentNode.removeChild(js);
    }
  });
}

export function checkCacheKey(node: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement, cacheKey: string|boolean) {
  return (typeof cacheKey === 'boolean' &&  cacheKey)
    || !node.getAttribute('cache')
    || node.getAttribute('cache') === cacheKey;
}

/**
 * cache all assets loaded by current sub-application
 */
export function cacheAssets(cacheKey: string): void {
  const assetsList = getAssetsNode();
  assetsList.forEach((assetsNode) => {
    // set cache key if asset attributes without prefix=static and cache
    if (assetsNode.getAttribute(PREFIX) !== STATIC && !assetsNode.getAttribute('cache')) {
      assetsNode.setAttribute('cache', cacheKey);
    }
  });
}