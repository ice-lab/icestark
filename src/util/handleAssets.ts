import { PREFIX, DYNAMIC, STATIC, IS_CSS_REGEX } from './constant';
import { getCache } from './cache';
import { warn, error } from './message';

const getCacheRoot = () => getCache('root');

const winFetch = window.fetch;
const COMMENT_REGEX = /<!--.*?-->/g;
const SCRIPT_REGEX = /<script\b[^>]*>([^<]*)<\/script>/gi;
const SCRIPT_SRC_REGEX = /<script\b[^>]*src=['"]?([^'"]*)['"]?\b[^>]*>/gi;
const LINK_HREF_REGEX = /<link\b[^>]*href=['"]?([^'"]*)['"]?\b[^>]*>/gi;
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
  assets: Asset[];
}

export interface ParsedConfig {
  origin: string;
  pathname: string;
}

/**
 * Create link element and append to root
 */
export function appendLink(
  root: HTMLElement | ShadowRoot,
  asset: string,
  id: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!root) reject(new Error(`no root element for css assert: ${asset}`));

    const element: HTMLLinkElement = document.createElement('link');

    element.setAttribute(PREFIX, DYNAMIC);
    element.id = id;
    element.rel = 'stylesheet';
    element.href = asset;

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
  asset: string,
  id: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!root) reject(new Error(`no root element for js assert: ${asset}`));

    const element: HTMLScriptElement = document.createElement('script');

    element.setAttribute(PREFIX, DYNAMIC);
    element.id = id;
    element.type = 'text/javascript';
    element.src = asset;
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
    urlList.map((cssUrl, index) => appendLink(root, cssUrl, `${PREFIX}-css-${index}`)),
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
  if (!html) return { html: '', assets: [] };

  const processedAssets = [];

  const processedHtml = html
    .replace(COMMENT_REGEX, '')
    .replace(SCRIPT_REGEX, (arg1, arg2) => {
      if (!arg1.match(SCRIPT_SRC_REGEX)) {
        processedAssets.push({
          type: AssetTypeEnum.INLINE,
          content: arg2,
        });

        return getComment('script', 'inline', AssetCommentEnum.REPLACED);
      } else {
        return arg1.replace(SCRIPT_SRC_REGEX, (_, argSrc2) => {
          const url = argSrc2.indexOf('//') >= 0 ? argSrc2 : getUrl(entry, argSrc2);
          processedAssets.push({
            type: AssetTypeEnum.EXTERNAL,
            content: url,
          });

          return getComment('script', argSrc2, AssetCommentEnum.REPLACED);
        });
      }
    })
    .replace(LINK_HREF_REGEX, (arg1, arg2) => {
      // not stylesheet, return as it is
      if (!arg1.match(STYLE_SHEET_REGEX)) {
        return arg1;
      }

      const url = arg2.indexOf('//') >= 0 ? arg2 : getUrl(entry, arg2);
      return `${getComment('link', arg2, AssetCommentEnum.PROCESSED)}   ${arg1.replace(arg2, url)}`;
    });

  return {
    html: processedHtml,
    assets: processedAssets,
  };
}

/**
 * Append external/inline script to root, need to be appended in order
 */
export function appendScript(root: HTMLElement | ShadowRoot, asset: Asset): Promise<string> {
  const { type, content } = asset;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    // inline script
    if (type === AssetTypeEnum.INLINE) {
      script.innerHTML = content;
      root.appendChild(script);
      resolve();
      return;
    }

    // external script
    script.setAttribute('src', content);
    script.addEventListener('load', () => resolve(), false);
    script.addEventListener('error', () => reject(new Error(`js asset loaded error: ${content}`)));
    root.appendChild(script);
  });
}

export async function appendProcessedContent(
  root: HTMLElement | ShadowRoot,
  processedContent: ProcessedContent,
) {
  const { html: processedHtml, assets } = processedContent;

  root.innerHTML = processedHtml;

  // make sure assets loaded in order
  await Array.prototype.slice.apply(assets).reduce((chain, asset) => {
    return chain.then(() => appendScript(root, asset));
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