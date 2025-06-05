/* eslint-disable max-lines */
/* eslint-disable no-param-reassign */
import urlParse from 'url-parse';
import Sandbox, { SandboxProps, SandboxConstructor } from '@ice/sandbox';
import { PREFIX, DYNAMIC, STATIC, IS_CSS_REGEX } from './constant';
import { toArray, isDev, formatMessage, builtInScriptAttributesMap, looseBoolean2Boolean, isElement, log } from './helpers';
import { formatErrMessage, ErrorCode } from './error';
import type { Fetch } from './globalConfiguration';
import type { ScriptAttributes } from '../apps';

const COMMENT_REGEX = /<!--.*?-->/g;
const BASE_LOOSE_REGEX = /<base\s[^>]*href=['"]?([^'"]*)['"]?[^>]*>/;

const EMPTY_STRING = '';
const STYLESHEET_LINK_TYPE = 'stylesheet';

const cachedScriptsContent: object = {};
const cachedStyleContent: object = {};
const cachedProcessedContent: object = {};

const defaultFetch = window?.fetch.bind(window);

export enum AssetTypeEnum {
  INLINE = 'inline',
  EXTERNAL = 'external',
  RUNTIME = 'runtime',
}

export enum AssetCommentEnum {
  REPLACED = 'replaced',
  PROCESSED = 'processed',
}

export interface Asset {
  module?: boolean;
  loaded?: boolean;
  type: AssetTypeEnum;
  /** Only used when type is AssetTypeEnum.RUNTIME */
  library?: string;
  /** Only used when type is AssetTypeEnum.RUNTIME */
  version?: string;
  content: string;
}

export interface ProcessedContent {
  html: HTMLElement;
  assets: Assets;
}

export interface Assets {
  jsList: Asset[];
  cssList: Array<Asset | HTMLElement>;
}

export interface ParsedConfig {
  origin: string;
  pathname: string;
}

// Lifecycle Props
export interface ILifecycleProps {
  container: HTMLElement;
  customProps?: object;
}

function isAssetExist(element: HTMLScriptElement | HTMLLinkElement, type: 'script' | 'link') {
  const urlAlias = type === 'script' ? 'src' : 'href';

  return Array.from(document.getElementsByTagName(type))
    .some((item) => {
      if (
        item[urlAlias]
        && element[urlAlias] === item[urlAlias]
      ) {
        return true;
      }
      return false;
    });
}

/**
 * Create link/style element and append to root
 */
export function appendCSS(
  root: HTMLElement | ShadowRoot,
  asset: Asset | HTMLElement,
  id: string,
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    if (!root) reject(new Error('no root element for css asset'));

    if (isElement(asset)) {
      root.append(asset);
      resolve();
      return;
    }

    const { type, content } = asset;

    if (type && type === AssetTypeEnum.INLINE) {
      const styleElement: HTMLStyleElement = document.createElement('style');
      styleElement.id = id;
      styleElement.setAttribute(PREFIX, DYNAMIC);
      styleElement.innerHTML = content;
      root.appendChild(styleElement);
      resolve();
      return;
    }

    /**
     * if external resource is cached by prefetch, use cached content instead.
     * For cachedStyleContent may fail to fetch (cors, and so on)，recover to original way
     */
    let useExternalLink = true;
    if (type && type === AssetTypeEnum.EXTERNAL && cachedStyleContent[content]) {
      try {
        const styleElement: HTMLStyleElement = document.createElement('style');
        styleElement.innerHTML = await cachedStyleContent[content];
        styleElement.id = id;
        styleElement.setAttribute(PREFIX, DYNAMIC);
        root.appendChild(styleElement);
        useExternalLink = false;
        resolve();
      } catch (e) {
        useExternalLink = true;
      }
    }

    if (useExternalLink) {
      const element: HTMLLinkElement = document.createElement('link');
      element.setAttribute(PREFIX, DYNAMIC);
      element.id = id;
      element.rel = 'stylesheet';
      element.href = content;

      element.addEventListener(
        'error',
        () => {
          log.error(
            formatErrMessage(
              ErrorCode.CSS_LOAD_ERROR,
              isDev && 'The stylesheets loaded error: {0}',
              (content || asset) as string,
            ),
          );
          return resolve();
        },
        false,
      );
      element.addEventListener('load', () => resolve(), false);

      root.appendChild(element);
    }
  });
}

/**
 * append custom attribute for element
 */
function setAttributeForScriptNode(element: HTMLScriptElement, {
  module,
  id,
  src,
  scriptAttributes,
}: {
  module: boolean;
  id: string;
  src: string;
  scriptAttributes: ScriptAttributes;
}) {
  /*
  * stamped by icestark for recycle when needed.
  */
  element.setAttribute(PREFIX, DYNAMIC);
  element.id = id;


  element.type = module ? 'module' : 'text/javascript';
  element.src = src;

  /**
  * `async=false` is required to make sure all js resources execute sequentially.
   */
  element.async = false;

  /**
  * `type` is allowed to set as `module`, `nomodule` and so on.
  */
  const unableReachedAttributes = [PREFIX, 'id', 'src', 'async'];

  const attrs = typeof (scriptAttributes) === 'function'
    ? scriptAttributes(src)
    : scriptAttributes;

  if (!Array.isArray(attrs)) {
    isDev && (
      console.warn(formatMessage('scriptAttributes should be Array or Function that returns Array.'))
    );
    return;
  }

  attrs.forEach((attr) => {
    const [attrKey, attrValue] = attr.split('=');
    if (unableReachedAttributes.includes(attrKey)) {
      (isDev ? console.warn : console.log)(formatMessage(`${attrKey} will be ignored by icestark.`));
      return;
    }

    if (builtInScriptAttributesMap.has(attrKey)) {
      /*
      * built in attribute like ["crossorigin=use-credentials"]、["nomodule"] should be set as follow:
      * script.crossOrigin = 'use-credentials';
      * script.noModule = true;
      */
      const nonLooseBooleanAttrValue = looseBoolean2Boolean(attrValue);
      element[builtInScriptAttributesMap.get(attrKey)] = nonLooseBooleanAttrValue === undefined || nonLooseBooleanAttrValue;
    } else {
      /*
      * none built in attribute added by `setAttribute`
      */
      element.setAttribute(attrKey, attrValue);
    }
  });
}

/**
 * Create script element (without inline) and append to root
 */
export function appendExternalScript(asset: string | Asset,
  {
    id,
    root = document.getElementsByTagName('head')[0],
    scriptAttributes = [],
  }: {
    id: string;
    root?: HTMLElement | ShadowRoot;
    scriptAttributes?: ScriptAttributes;
  }): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const { type, content, module } = (asset as Asset);

    const element: HTMLScriptElement = document.createElement('script');
    // inline script
    if (type && type === AssetTypeEnum.INLINE) {
      element.innerHTML = content;
      element.id = id;
      element.setAttribute(PREFIX, DYNAMIC);
      module && (element.type = 'module');
      root.appendChild(element);

      /*
      * For inline script never fire onload event, resolve it immediately.
      */
      resolve();
      return;
    }

    setAttributeForScriptNode(element, {
      module,
      id,
      src: content || (asset as string),
      scriptAttributes,
    });

    if (isAssetExist(element, 'script')) {
      resolve();
      return;
    }

    element.addEventListener(
      'error',
      () => {
        reject(
          new Error(
            formatErrMessage(
              ErrorCode.JS_LOAD_ERROR,
              isDev && 'The script resources loaded error: {0}',
              (content || asset) as string,
            ),
          ),
        );
      },
      false,
    );
    element.addEventListener('load', () => resolve(), false);

    root.appendChild(element);
  });
}

export function getUrlAssets(urls: string | string[]) {
  const jsList = [];
  const cssList = [];

  toArray(urls).forEach((url) => {
    // //icestark.com/index.css -> true
    // //icestark.com/index.css?timeSamp=1575443657834 -> true
    // //icestark.com/index.css?query=test.js -> false
    const isCss: boolean = IS_CSS_REGEX.test(url);
    const assest: Asset = {
      type: AssetTypeEnum.EXTERNAL,
      content: url,
    };
    if (isCss) {
      cssList.push(assest);
    } else {
      jsList.push(assest);
    }
  });

  return { jsList, cssList };
}

export async function fetchScripts(jsList: Asset[], fetch: Fetch = defaultFetch): Promise<string[]> {
  let jsBeforeRuntime = '';
  let jsAfterRuntime = '';
  jsList.forEach((asset) => {
    if (asset.type === AssetTypeEnum.RUNTIME) {
      const { library, version } = asset;
      const globalLib = `window['${library}']`;
      const backupLib = `window['__${library}__']`;
      const versionedLib = `window['${library}@${version}']`;
      const backupCode = `if (${globalLib}) {${backupLib} = ${globalLib};}\n`;
      const restoreCode = `if (${backupLib}) {${globalLib} = ${backupLib};${backupLib} = undefined;}\n`;
      jsBeforeRuntime = `${jsBeforeRuntime}${backupCode}${asset.loaded ? `${globalLib} = ${versionedLib};` : ''}`;
      jsAfterRuntime = `${jsAfterRuntime}${asset.loaded ? '' : `${versionedLib} = ${globalLib};`}${restoreCode}`;
    }
  });

  const result = await Promise.all(jsList.filter((asset) => !asset.loaded).map(async (asset) => {
    const { type, content } = asset;
    if (type === AssetTypeEnum.INLINE) {
      return {
        type,
        content,
      };
    } else {
      const cacheKey = `${content}${type === AssetTypeEnum.RUNTIME ? '?runtime' : ''}`;
      // content will script url when type is AssetTypeEnum.EXTERNAL
      // eslint-disable-next-line no-return-assign
      return {
        type,
        content: cachedScriptsContent[cacheKey]
        /**
        * If code is being evaluated as a string with `eval` or via `new Function`，then the source origin
        * will be the page's origin. As a result, `//# sourceURL` appends to the generated code.
        * See https://sourcemaps.info/spec.html
        */
        || (cachedScriptsContent[cacheKey] = await fetch(content)
          .then((res) => res.text())
          .then((res) => `${res} \n //# sourceURL=${content}`)
        ),
      };
    }
  }));
  const scriptTexts = [];
  let hasInsertedBeforeRuntime = false;

  for (let i = 0; i < result.length; i++) {
    const { type, content } = result[i];

    // Insert jsBeforeRuntime before the first runtime script
    if (type === AssetTypeEnum.RUNTIME && !hasInsertedBeforeRuntime) {
      scriptTexts.push(jsBeforeRuntime);
      hasInsertedBeforeRuntime = true;
    }
    // Add the script content
    scriptTexts.push(content);

    // Insert jsAfterRuntime after the runtime script
    if (type === AssetTypeEnum.RUNTIME && result[i + 1]?.type !== AssetTypeEnum.RUNTIME) {
      scriptTexts.push(jsAfterRuntime);
    }
  }

  return scriptTexts;
}

// for prefetch
export function fetchStyles(cssList: Asset[], fetch: Fetch = defaultFetch) {
  return Promise.all(
    cssList.map((asset) => {
      const { type, content } = asset;
      if (type === AssetTypeEnum.INLINE) {
        return content;
      }
      // eslint-disable-next-line no-return-assign
      return cachedStyleContent[content] || (cachedStyleContent[content] = fetch(content).then((res) => res.text()));
    }),
  );
}

export function parseUrl(entry: string): ParsedConfig {
  const { origin, pathname } = urlParse(entry);
  return {
    origin,
    pathname,
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
  return `${tag} ${from} ${type} by @ice/stark`;
}

/**
 * check if link is absolute url
 * @param url
 */
export function isAbsoluteUrl(url: string): boolean {
  return (/^(https?:)?\/\/.+/).test(url);
}

/**
 * Replace processed nodes to comment node.
 */
export function replaceNodeWithComment(node: HTMLElement, comment: string): void {
  if (node?.parentNode) {
    const commentNode = document.createComment(comment);
    node.parentNode.appendChild(commentNode);
    node.parentNode.removeChild(node);
  }
}

/**
* Deal with inline script for es module, like `import refresh from '/@refresh.js'` should be replaced
* by absolute one `import refresh from '/@refresh.js'`.
* Once we hoped ShadowDOM can help, but it's impossible to customize url of shadow root for now.
* https://github.com/WICG/webcomponents/issues/581
*/
export function replaceImportIdentifier(text: string, base: string) {
  let localText = text;
  const importRegex = /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+?)|)(?:(?:"(.*?)")|(?:'(.*?)'))[\s]*?(?:;|$|)/;
  const matches = text.match(new RegExp(importRegex, 'g'));

  if (matches) {
    matches.forEach((matchStr) => {
      const [, doubleQuoteImporter, singleQuoteImporter] = matchStr.match(importRegex);
      const identifier = doubleQuoteImporter || singleQuoteImporter;

      if (!isAbsoluteUrl(identifier)) {
        const absoluteIdentifier = getUrl(base, identifier);
        const replacedImportStatement = matchStr.replace(identifier, absoluteIdentifier);

        localText = text.replace(matchStr, replacedImportStatement);
      }
    });
  }
  return localText;
}

/**
 * html -> { html: processedHtml, assets: processedAssets }
 */
export function processHtml(html: string, entry?: string): ProcessedContent {
  if (!html) return { html: document.createElement('div'), assets: { cssList: [], jsList: [] } };

  const domContent = (new DOMParser()).parseFromString(html.replace(COMMENT_REGEX, ''), 'text/html');

  /*
  * When using DOMParser，the origin of relative path of `<script />` 和 `<link />` is Framwork's origin.
  * To escape this error, append <base /> element and then remove them to avoid conflict.
   */
  if (entry) {
    const baseElementMatch = html.match(BASE_LOOSE_REGEX);

    const baseElements = domContent.getElementsByTagName('base');
    const hasBaseElement = baseElements.length > 0;

    if (baseElementMatch && hasBaseElement) {
      // Only take the first one into consideration.
      const baseElement = baseElements[0];

      const [, baseHerf] = baseElementMatch;
      baseElement.href = isAbsoluteUrl(baseHerf) ? baseHerf : getUrl(entry, baseHerf);
    } else {
      // add base URI for absolute resource.
      // see more https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
      const base = document.createElement('base');
      // <base /> element also takes effects if href includues `.html`
      base.href = entry;
      domContent.getElementsByTagName('head')[0].appendChild(base);
    }
  }

  // process js assets
  const scripts = Array.from(domContent.getElementsByTagName('script'));
  const processedJSAssets = scripts.map((script) => {
    const inlineScript = script.src === EMPTY_STRING;
    const module = script.type === 'module';

    const externalSrc = !inlineScript && (isAbsoluteUrl(script.src) ? script.src : getUrl(entry, script.src));

    const commentType = inlineScript ? AssetCommentEnum.PROCESSED : AssetCommentEnum.REPLACED;
    replaceNodeWithComment(script, getComment('script', inlineScript ? 'inline' : script.src, commentType));

    return {
      module,
      type: inlineScript ? AssetTypeEnum.INLINE : AssetTypeEnum.EXTERNAL,
      content:
        inlineScript
          ? (
            // If entryContent provided, skip this.
            (module && entry)
              ? replaceImportIdentifier(script.text, entry)
              : script.text)
          : externalSrc,
    };
  });

  // process css assets
  const inlineStyleSheets = Array.from(domContent.getElementsByTagName('style'));
  const externalStyleSheets = Array.from(domContent.getElementsByTagName('link'))
    .filter((link) => !link.rel || link.rel.includes(STYLESHEET_LINK_TYPE));

  const processedCSSAssets = [
    ...inlineStyleSheets
      .map((sheet) => {
        replaceNodeWithComment(sheet, getComment('style', 'inline', AssetCommentEnum.REPLACED));
        return {
          type: AssetTypeEnum.INLINE,
          content: sheet.innerText,
        };
      }),
    ...externalStyleSheets
      .map((sheet) => {
        replaceNodeWithComment(sheet, getComment('link', sheet.href, AssetCommentEnum.PROCESSED));
        return {
          type: AssetTypeEnum.EXTERNAL,
          content: isAbsoluteUrl(sheet.href) ? sheet.href : getUrl(entry, sheet.href),
        };
      }),
  ];

  if (entry) {
    /*
    * Remove all child's <base /> element to avoid conflict with parent's.
     */
    const baseNodes = domContent.getElementsByTagName('base');
    for (let i = 0; i < baseNodes.length; ++i) {
      baseNodes[i]?.parentNode.removeChild(baseNodes[i]);
    }
  }

  return {
    html: domContent.getElementsByTagName('html')[0],
    assets: {
      jsList: processedJSAssets,
      cssList: processedCSSAssets,
    },
  };
}

export async function getEntryAssets({
  root,
  entry,
  entryContent,
  assetsCacheKey,
  href = location.href,
  fetch = defaultFetch,
}: {
  root?: HTMLElement | ShadowRoot;
  entry?: string;
  entryContent?: string;
  assetsCacheKey: string;
  href?: string;
  fetch?: Fetch;
  assertsCached?: boolean;
}) {
  const cachedContent = cachedProcessedContent[assetsCacheKey];
  let htmlContent = entryContent;

  if (!cachedContent) {
    if (!htmlContent && entry) {
      if (!fetch) {
        log.warn('Current environment does not support window.fetch, please use custom fetch');
        throw new Error(
          `fetch ${entry} error: Current environment does not support window.fetch, please use custom fetch`,
        );
      }

      htmlContent = await fetch(entry).then((res) => res.text());
    }
    cachedProcessedContent[assetsCacheKey] = htmlContent;
  }

  const { html, assets } = processHtml(cachedContent || htmlContent, entry || href);

  if (root) {
    root.appendChild(html);
  }

  return assets;
}

export function getAssetsNode(): Array<HTMLStyleElement|HTMLScriptElement> {
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
 * Remove all child's suspected assets.
 * @returns Removed assets.
 */
export function emptyAssets(
  shouldRemove: (
    assetUrl: string,
    element?: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement,
  ) => boolean,
  cacheKey: string|boolean,
) {
  const removedAssets: HTMLElement[] = [];
  // remove extra assets
  const styleList: NodeListOf<HTMLStyleElement> = document.querySelectorAll(
    `style:not([${PREFIX}=${STATIC}])`,
  );
  styleList.forEach((style) => {
    if (shouldRemove(null, style) && checkCacheKey(style, cacheKey)) {
      style.parentNode.removeChild(style);

      removedAssets.push(style);
    }
  });

  const linkList: NodeListOf<HTMLLIElement> = document.querySelectorAll(
    `link:not([${PREFIX}=${STATIC}])`,
  );
  linkList.forEach((link) => {
    if (shouldRemove(link.getAttribute('href'), link) && checkCacheKey(link, cacheKey)) {
      link.parentNode.removeChild(link);

      removedAssets.push(link);
    }
  });

  const jsExtraList: NodeListOf<HTMLScriptElement> = document.querySelectorAll(
    `script:not([${PREFIX}=${STATIC}])`,
  );
  jsExtraList.forEach((js) => {
    if (shouldRemove(js.getAttribute('src'), js) && checkCacheKey(js, cacheKey)) {
      js.parentNode.removeChild(js);

      removedAssets.push(js);
    }
  });

  return removedAssets;
}

export function checkCacheKey(node: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement, cacheKey: string|boolean) {
  return (typeof cacheKey === 'boolean' && cacheKey)
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

/**
 * load and append css assets
 *
 * @export
 * @param {Assets} assets
 */
export async function loadAndAppendCssAssets(cssList: Array<Asset | HTMLElement>, {
  cacheCss = false,
  fetch = defaultFetch,
}: {
  cacheCss?: boolean;
  fetch?: Fetch;
}) {
  const cssRoot: HTMLElement = document.getElementsByTagName('head')[0];

  if (cacheCss) {
    let useLinks = false;
    let cssContents = null;

    try {
      // No need to cache css when running into `<style />`
      const needCachedCss = cssList.filter((css) => !isElement(css));
      cssContents = await fetchStyles(
        needCachedCss as Asset[],
        fetch,
      );
    } catch (e) {
      useLinks = true;
    }

    // Try hard to avoid break-change if fetching links error.
    // And supposed to be remove from 3.x
    if (!useLinks) {
      return await Promise.all([
        ...cssContents.map((content, index) => appendCSS(
          cssRoot,
          { content, type: AssetTypeEnum.INLINE }, `${PREFIX}-css-${index}`,
        )),
        ...cssList.filter((css) => isElement(css)).map((asset, index) => appendCSS(cssRoot, asset, `${PREFIX}-css-${index}`)),
      ]);
    }
  }

  // load css content
  return await Promise.all(
    cssList.map((asset, index) => appendCSS(cssRoot, asset, `${PREFIX}-css-${index}`)),
  );
}

/**
 * load and append js assets, compatible with v1
 *
 * @export
 * @param {Assets} assets
 * @param {Sandbox} [sandbox]
 * @returns
 */
export function loadAndAppendJsAssets(
  assets: Assets,
  {
    scriptAttributes = [],
  }: {
    scriptAttributes?: ScriptAttributes;
  },
) {
  const jsRoot: HTMLElement = document.getElementsByTagName('head')[0];

  const { jsList } = assets;

  // dispose inline script
  const hasInlineScript = jsList.find((asset) => asset.type === AssetTypeEnum.INLINE);
  if (hasInlineScript) {
    // make sure js assets loaded in order if has inline scripts
    return jsList.reduce((chain, asset, index) => {
      return chain.then(() => appendExternalScript(asset, {
        root: jsRoot,
        scriptAttributes,
        id: `${PREFIX}-js-${index}`,
      }));
    }, Promise.resolve());
  }

  return Promise.all(
    jsList.map((asset, index) => appendExternalScript(asset, {
      root: jsRoot,
      scriptAttributes,
      id: `${PREFIX}-js-${index}`,
    })),
  );
}

export function createSandbox(sandbox?: boolean | SandboxProps | SandboxConstructor) {
  // Create appSandbox if sandbox is active
  let appSandbox = null;
  if (sandbox) {
    if (typeof sandbox === 'function') {
      // eslint-disable-next-line new-cap
      appSandbox = new sandbox();
    } else {
      const sandboxProps = typeof sandbox === 'boolean' ? {} : (sandbox as SandboxProps);
      appSandbox = new Sandbox(sandboxProps);
    }
  }
  return appSandbox;
}

/**
 * Get classified assets.
 */
type RemovedAssetType = 'SCRIPT' | 'LINK' | 'STYLE';

export function filterRemovedAssets(assets: HTMLElement[], types: RemovedAssetType[]): Asset[] {
  return assets
    .reduce((pre, element) => {
      // escape stamped element
      if (element.getAttribute(PREFIX) === DYNAMIC) {
        return pre;
      }

      if (types.includes(element.nodeName as RemovedAssetType)) {
        return [
          ...pre,
          element,
        ];
      }

      return pre;
    }, []);
}

