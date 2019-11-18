import { warn } from './utils';

const winFetch = window.fetch;
const META_REGEX = /<meta.*?>/gi;
const SCRIPT_SRC_REGEX = /<script\b[^>]*src=[\'|\"]?([^\'|\"]*)[\'|\"]?\b[^>]*>/gi;
const LINK_HREF_REGEX = /<link\b[^>]*href=[\'|\"]?([^\'|\"]*)[\'|\"]?\b[^>]*>/gi;
const STYLE_SHEET_REGEX = /rel=[\'|\"]stylesheet[\'|\"]/gi;

export interface ProcessedContent {
  html: string;
  url: string[];
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

export function processHtml(html: string, htmlUrl?: string): ProcessedContent {
  if (!html) return { html: '', url: [] };

  const processedUrl = [];

  const processedHtml = html
    .replace(META_REGEX, '')
    .replace(SCRIPT_SRC_REGEX, (arg1, arg2) => {
      if (arg2.indexOf('//') >= 0) {
        processedUrl.push(arg2);
      } else {
        processedUrl.push(getUrl(htmlUrl, arg2));
      }
      return '';
    })
    .replace(LINK_HREF_REGEX, (arg1, arg2) => {
      // not stylesheet, return as it is
      if (!arg1.match(STYLE_SHEET_REGEX)) {
        return arg1;
      }

      if (arg2.indexOf('//') >= 0) {
        processedUrl.push(arg2);
      } else {
        processedUrl.push(getUrl(htmlUrl, arg2));
      }
      return '';
    });

  return {
    html: processedHtml,
    url: processedUrl,
  };
}

export default async function fetchHTML(
  htmlUrl: string,
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> = winFetch,
): Promise<ProcessedContent | String | void> {
  if (!fetch) {
    return new Promise((_, reject) => {
      warn('Current environment does not support window.fetch, please use custom fetch');
      reject('Current environment does not support window.fetch, please use custom fetch');
    });
  }

  return fetch(htmlUrl)
    .then(res => res.text())
    .then(html => processHtml(html, htmlUrl))
    .catch(err => {
      warn(`fetch ${htmlUrl} error: ${err}`);
      return `fetch ${htmlUrl} error: ${err}`;
    });
}
