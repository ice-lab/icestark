/* eslint prefer-promise-reject-errors: 0 */

import { PREFIX, DYNAMIC, STATIC } from './constant';
import { getCache } from './cache';
import warn from './warn';

const getCacheRoot = () => getCache('root');

/**
 * load assets
 */
function loadAsset(
  url: string,
  index: number,
  isCss: boolean,
  root: HTMLElement | ShadowRoot,
  callback: (err?: any) => void,
): void {
  if (isCss && !getCacheRoot()) return;

  let id = `${PREFIX}-js-${index}`;
  let type = 'script';

  if (isCss) {
    id = `${PREFIX}-css-${index}`;
    type = 'link';
  }

  const element: HTMLScriptElement | HTMLLinkElement | HTMLElement = document.createElement(type);
  element.id = id;
  element.setAttribute(PREFIX, DYNAMIC);

  if (isCss) {
    (element as HTMLLinkElement).rel = 'stylesheet';
    (element as HTMLLinkElement).href = url;
  } else {
    (element as HTMLScriptElement).type = 'text/javascript';
    (element as HTMLScriptElement).src = url;
    (element as HTMLScriptElement).async = false;
  }

  element.addEventListener(
    'error',
    () => {
      callback(isCss ? undefined : `js asset loaded error: ${url}`);
    },
    false,
  );
  element.addEventListener('load', () => callback(), false);

  root.appendChild(element);
}

export function loadAssets(
  assetsList: string[],
  useShadow: boolean,
  jsCallback: (err: any) => boolean,
  cssCallBack: () => void,
): void {
  const jsRoot: HTMLElement = document.getElementsByTagName('head')[0];
  const cssRoot: HTMLElement | ShadowRoot = useShadow
    ? getCacheRoot()
    : document.getElementsByTagName('head')[0];

  const jsList: string[] = [];
  const cssList: string[] = [];

  assetsList.forEach(url => {
    const isCss: boolean = /\.css$/.test(url);
    if (isCss) {
      cssList.push(url);
    } else {
      jsList.push(url);
    }
  });

  function loadCss(): void {
    let cssTotal = 0;
    cssList.forEach((cssUrl, index) => {
      loadAsset(cssUrl, index, true, cssRoot, () => {
        // make sure the cssCallback function executes after all css have been loaded
        cssTotal++;
        if (cssTotal === cssList.length) {
          cssCallBack();
        }
      });
    });
  }

  function loadJs(): void {
    let jsTotal = 0;
    let canCancel = false;
    jsList.forEach((jsUrl, index) => {
      loadAsset(jsUrl, index, false, jsRoot, (err: any) => {
        // has error or current App is unmounted, cancel load css
        if (canCancel) return;

        canCancel = jsCallback(err);
        // make sure css loads after all js have been loaded under shadowRoot
        jsTotal++;
        if (useShadow && jsTotal === jsList.length) {
          loadCss();
        }
      });
    });
  }

  if (useShadow) {
    // make sure css loads after all js have been loaded under shadowRoot
    loadJs();
  } else {
    loadCss();
    loadJs();
  }
}

/**
 * record static assets
 */
export function recordAssets(): void {
  // getElementsByTagName is faster than querySelectorAll
  const styleList: HTMLCollectionOf<HTMLStyleElement> = document.getElementsByTagName('style');
  const linkList: HTMLCollectionOf<HTMLStyleElement> = document.getElementsByTagName('link');
  const jsList: HTMLCollectionOf<HTMLScriptElement> = document.getElementsByTagName('script');

  for (let i = 0; i < styleList.length; i++) {
    setStaticAttribute(styleList[i]);
  }

  for (let i = 0; i < linkList.length; i++) {
    setStaticAttribute(linkList[i]);
  }

  for (let i = 0; i < jsList.length; i++) {
    setStaticAttribute(jsList[i]);
  }
}

export function setStaticAttribute(tag: HTMLStyleElement | HTMLScriptElement): void {
  if (tag.getAttribute(PREFIX) !== DYNAMIC) {
    tag.setAttribute(PREFIX, STATIC);
  }
  tag = null;
}

/**
 * empty useless assets
 */
export function emptyAssets(useShadow: boolean): void {
  const jsRoot: HTMLElement = document.getElementsByTagName('head')[0];
  const cssRoot: HTMLElement | ShadowRoot = useShadow
    ? getCacheRoot()
    : document.getElementsByTagName('head')[0];

  // remove dynamic assets
  const jsList: NodeListOf<HTMLElement> = jsRoot.querySelectorAll(`script[${PREFIX}=${DYNAMIC}]`);
  jsList.forEach(js => {
    jsRoot.removeChild(js);
  });

  const cssList: NodeListOf<HTMLElement> = cssRoot.querySelectorAll(`link[${PREFIX}=${DYNAMIC}]`);
  cssList.forEach(css => {
    cssRoot.removeChild(css);
  });

  // remove extra assets
  const styleList: NodeListOf<HTMLElement> = document.querySelectorAll(
    `style:not([${PREFIX}=${STATIC}])`,
  );
  styleList.forEach(style => style.parentNode.removeChild(style));

  const linkList: NodeListOf<HTMLElement> = document.querySelectorAll(
    `link:not([${PREFIX}=${STATIC}])`,
  );
  linkList.forEach(link => link.parentNode.removeChild(link));

  const jsExtraList: NodeListOf<HTMLElement> = document.querySelectorAll(
    `script:not([${PREFIX}=${STATIC}])`,
  );
  jsExtraList.forEach(js => js.parentNode.removeChild(js));
}

const winFetch = window.fetch;
const META_REGEX = /<meta.*?>/gi;
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

export function parseUrl(htmlUrl: string): ParsedConfig {
  const a = document.createElement('a');
  a.href = htmlUrl;

  return {
    origin: a.origin,
    pathname: a.pathname,
  };
}

export function startWith(url: string, prefix: string): boolean {
  return url.slice(0, prefix.length) === prefix;
}

export function getUrl(htmlUrl: string, relativePath: string): string {
  const { origin, pathname } = parseUrl(htmlUrl);

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

export function getComments(tag: string, from: string, type: AssetCommentEnum): string {
  return `<!--${tag} ${from} ${type} by @ice/stark-html-->`;
}

export function processHtml(html: string, htmlUrl?: string): ProcessedContent {
  if (!html) return { html: '', assets: [] };

  const processedAssets = [];

  const processedHtml = html
    .replace(META_REGEX, '')
    .replace(SCRIPT_REGEX, (arg1, arg2) => {
      if (!arg1.match(SCRIPT_SRC_REGEX)) {
        processedAssets.push({
          type: AssetTypeEnum.INLINE,
          content: arg2,
        });

        return getComments('script', 'inline', AssetCommentEnum.REPLACED);
      } else {
        return arg1.replace(SCRIPT_SRC_REGEX, (argSrc1, argSrc2) => {
          const url = argSrc2.indexOf('//') >= 0 ? argSrc2 : getUrl(htmlUrl, argSrc2);
          processedAssets.push({
            type: AssetTypeEnum.EXTERNAL,
            content: url,
          });

          return getComments('script', argSrc2, AssetCommentEnum.REPLACED);
        });
      }
    })
    .replace(LINK_HREF_REGEX, (arg1, arg2) => {
      // not stylesheet, return as it is
      if (!arg1.match(STYLE_SHEET_REGEX)) {
        return arg1;
      }

      const url = arg2.indexOf('//') >= 0 ? arg2 : getUrl(htmlUrl, arg2);
      return `${getComments('link', arg2, AssetCommentEnum.PROCESSED)}   ${arg1.replace(
        arg2,
        url,
      )}`;
    });

  return {
    html: processedHtml,
    assets: processedAssets,
  };
}

export function appendScript(root: HTMLElement | ShadowRoot, asset: Asset) {
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
    script.addEventListener('error', () => reject(`js asset loaded error: ${content}`));
    root.appendChild(script);
  });
}

export default function loadHtml(
  root: HTMLElement | ShadowRoot,
  htmlUrl: string,
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> = winFetch,
): Promise<string> {
  if (!fetch) {
    return new Promise((_, reject) => {
      warn('Current environment does not support window.fetch, please use custom fetch');
      reject(
        `fetch ${htmlUrl} error: Current environment does not support window.fetch, please use custom fetch`,
      );
    });
  }

  return fetch(htmlUrl)
    .then(res => res.text())
    .then(html => {
      const { html: processedHtml, assets } = processHtml(html, htmlUrl);

      root.innerHTML = processedHtml;

      // make sure assets loaded in order
      return Array.prototype.slice.apply(assets).reduce((chain, asset) => {
        return chain.then(() => appendScript(root, asset));
      }, Promise.resolve());
    });
}
