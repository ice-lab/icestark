const PREFIX = 'icestark-module';

const winFetch = window.fetch;
const COMMENT_REGEX = /<!--.*?-->/g;
const SCRIPT_REGEX = /<script\b[^>]*>([^<]*)<\/script>/gi;
const SCRIPT_SRC_REGEX = /<script\b[^>]*src=['"]?([^'"]*)['"]?\b[^>]*>/gi;
const LINK_HREF_REGEX = /<link\b[^>]*href=['"]?([^'"]*)['"]?\b[^>]*>/gi;
const STYLE_SHEET_REGEX = /rel=['"]stylesheet['"]/gi;
const IS_CSS_REGEX = /\.css(\?((?!\.js$).)+)?$/;

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

export function error(message: string): void {
  return console && console.error(message);
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

export async function appendAssets(root: HTMLElement, assetsList: string[]) {
  const jsList: string[] = [];
  const cssList: string[] = [];

  assetsList.forEach(url => {
    // //icestark-module.com/index.css -> true
    // //icestark-module.com/index.css?timeSamp=1575443657834 -> true
    // //icestark-module.com/index.css?query=test.js -> false
    const isCss: boolean = IS_CSS_REGEX.test(url);
    if (isCss) {
      cssList.push(url);
    } else {
      jsList.push(url);
    }
  });

  await appendAllLink(root, cssList);
  await appendAllScriptWithOutInline(root, jsList);
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

  // https://icestark-module.com/dynamic/index.html + ./js/index.js -> https://icestark-module.com/dynamic/js/index.js
  if (startWith(relativePath, './')) {
    const rPath = relativePath.slice(1);

    if (!pathname || pathname === '/') {
      return `${origin}${rPath}`;
    }

    const pathArr = pathname.split('/');
    pathArr.splice(-1);
    return `${origin}${pathArr.join('/')}${rPath}`;
  } else if (startWith(relativePath, '/')) {
    // https://icestark-module.com/icestark-namic/index.html + /js/index.js -> https://icestark-module.com/js/index.js
    return `${origin}${relativePath}`;
  } else {
    // https://icestark-module.com + js/index.js -> https://icestark-module.com/js/index.js
    return `${origin}/${relativePath}`;
  }
}

/**
 * If script/link processed by icestark-module, add comment for it
 */
export function getComment(tag: string, from: string, type: AssetCommentEnum): string {
  return `<!--${tag} ${from} ${type} by icestark-module-->`;
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
) {
  await appendProcessedContent(root, processHtml(entryContent, href));
}
