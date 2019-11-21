/* eslint prefer-promise-reject-errors: 0 */

import { warn } from './utils';

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

export function getReplacementComments(tag: string, from: string): string {
  return `<!--${tag} ${from} replaced by @ice/stark-html-->`;
}

export function getProcessedComments(tag: string, from: string): string {
  return `<!--${tag} ${from} processed by @ice/stark-html-->`;
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

        return getReplacementComments('script', 'inline');
      } else {
        return arg1.replace(SCRIPT_SRC_REGEX, (argSrc1, argSrc2) => {
          const url = argSrc2.indexOf('//') >= 0 ? argSrc2 : getUrl(htmlUrl, argSrc2);
          processedAssets.push({
            type: AssetTypeEnum.EXTERNAL,
            content: url,
          });

          return getReplacementComments('script', argSrc2);
        });
      }
    })
    .replace(LINK_HREF_REGEX, (arg1, arg2) => {
      // not stylesheet, return as it is
      if (!arg1.match(STYLE_SHEET_REGEX)) {
        return arg1;
      }

      const url = arg2.indexOf('//') >= 0 ? arg2 : getUrl(htmlUrl, arg2);
      return `${getProcessedComments('link', arg2)}   ${arg1.replace(arg2, url)}`;
    });

  return {
    html: processedHtml,
    assets: processedAssets,
  };
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
    })
    .catch(err => {
      warn(`fetch ${htmlUrl} error: ${err}`);
      return err;
    });
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
