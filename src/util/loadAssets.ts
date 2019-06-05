import { PREFIX, DYNAMIC } from '../constant';
import { getIcestarkRoot } from './index';

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
  if (isCss && !getIcestarkRoot()) return;

  let id = `${PREFIX}-js-${index}`;
  let type = 'script';

  if (isCss) {
    id = `${PREFIX}-css-${index}`;
    type = 'link';
  }

  let element: HTMLScriptElement | HTMLLinkElement | HTMLElement;

  element = document.createElement(type);
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
      callback(isCss ? undefined : new Error(`JS asset loaded error: ${url}`));
    },
    false,
  );
  element.addEventListener('load', () => callback(), false);

  root.appendChild(element);
}

export default function loadAssets(
  bundleList: string[],
  useShadow: boolean,
  jsCallback: (err: any) => boolean,
  cssCallBack: () => void,
): void {
  const jsRoot: HTMLElement = document.getElementsByTagName('head')[0];
  const cssRoot: HTMLElement | ShadowRoot = useShadow
    ? getIcestarkRoot()
    : document.getElementsByTagName('head')[0];

  const jsList: string[] = [];
  const cssList: string[] = [];

  bundleList.forEach(url => {
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
