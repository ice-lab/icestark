import { warn } from './utils';

const winFetch = window.fetch;
const META_REGEX = /<meta.*?>/gi;
const SCRIPT_SRC_REGEX = /<script\b[^>]*src=[\'|\"]?([^\'|\"]*)[\'|\"]?\b[^>]*>/gi;
const LINK_HREF_REGEX = /<link\b[^>]*href=[\'|\"]?([^\'|\"]*)[\'|\"]?\b[^>]*>/gi;

export function getOrigin(htmlUrl: string): string {
  const a = document.createElement('a');
  a.href = htmlUrl;

  return a.origin;
}

export function startWith(url: string, prefix: string): boolean {
  return url.slice(0, prefix.length) === prefix;
}

export function getUrl(origin: string, relativePath: string): string {
  // https://icestark.com + ./js/index.js -> https://icestark.com/js/index.js
  if (startWith(relativePath, './')) {
    relativePath.slice(0, 2);
    return `${origin}/${relativePath}`;
  } else if (startWith(relativePath, '/')) {
    // https://icestark.com + /js/index.js -> https://icestark.com/js/index.js
    return `${origin}${relativePath}`;
  } else {
    // https://icestark.com + js/index.js -> https://icestark.com/js/index.js
    return `${origin}/${relativePath}`;
  }
}

export function processHtml(html: string, htmlUrl?: string): string {
  if (!html) return '';

  const origin = getOrigin(htmlUrl);

  return html
    .replace(META_REGEX, '')
    .replace(SCRIPT_SRC_REGEX, (arg1, arg2) => {
      if (arg2.indexOf('//') >= 0) {
        return arg1;
      } else return arg1.replace(arg2, getUrl(origin, arg2));
    })
    .replace(LINK_HREF_REGEX, (arg1, arg2) => {
      if (arg2.indexOf('//') >= 0) {
        return arg1;
      } else return arg1.replace(arg2, getUrl(origin, arg2));
    });
}

export default async function fetchHTML(
  htmlUrl: string,
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> = winFetch,
): Promise<String> {
  if (!fetch) {
    warn('Current environment does not support window.fetch, please use custom fetch');
    return;
  }

  return fetch(htmlUrl)
    .then(res => res.text())
    .then(html => processHtml(html, htmlUrl))
    .catch(err => {
      warn(`fetch ${htmlUrl} error: ${err}`);
      return `fetch ${htmlUrl} error: ${err}`;
    });
}
