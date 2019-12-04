import { PREFIX, DYNAMIC, STATIC } from './constant';
import { getCache } from './cache';

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
  bundleList: string[],
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

  bundleList.forEach(url => {
    // //icestark.com/index.css -> true
    // //icestark.com/index.css?timeSamp=1575443657834 -> true
    // //icestark.com/index.css?query=test.js -> false
    const isCss: boolean = /\.css(\?((?!\.js$).)+)?$/.test(url);
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
    const style = styleList[i];
    style.setAttribute(PREFIX, STATIC);
  }

  for (let i = 0; i < linkList.length; i++) {
    const link = linkList[i];
    link.setAttribute(PREFIX, STATIC);
  }

  for (let i = 0; i < jsList.length; i++) {
    const js = jsList[i];
    js.setAttribute(PREFIX, STATIC);
  }
}

/**
 * empty useless assets
 */
export function emptyAssets(useShadow: boolean, isRemove: (assetUrl: string) => boolean): void {
  const jsRoot: HTMLElement = document.getElementsByTagName('head')[0];
  const cssRoot: HTMLElement | ShadowRoot = useShadow
    ? getCacheRoot()
    : document.getElementsByTagName('head')[0];

  // make sure isRemove is funcion
  if (typeof isRemove !== 'function') {
    isRemove = () => true;
  }

  // remove dynamic assets
  const jsList: NodeListOf<HTMLElement> = jsRoot.querySelectorAll(`script[${PREFIX}=${DYNAMIC}]`);
  jsList.forEach(js => {
    if (isRemove(js.getAttribute('src'))) {
      jsRoot.removeChild(js);
    }
  });

  const cssList: NodeListOf<HTMLElement> = cssRoot.querySelectorAll(`link[${PREFIX}=${DYNAMIC}]`);
  cssList.forEach(css => {
    if (isRemove(css.getAttribute('href'))) {
      cssRoot.removeChild(css);
    }
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
