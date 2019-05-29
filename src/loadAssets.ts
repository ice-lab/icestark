import { getIcestarkRoot } from './getMountNode';
import { PREFIX } from './constant';

const tagData: string = 'asset';

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

  if (useShadow) {
    // make sure css loads after all js have been loaded under shadowRoot
    loadJs();
  } else {
    loadCss();
    loadJs();
  }

  function loadCss(): void {
    let cssTotal: number = 0;
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
    let jsTotal: number = 0;
    let canCancel: boolean = false;
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
}

/**
 * empty useless assets
 */
export function emptyAssets(useShadow: boolean): void {
  const jsRoot: HTMLElement = document.getElementsByTagName('head')[0];
  const cssRoot: HTMLElement | ShadowRoot = useShadow
    ? getIcestarkRoot()
    : document.getElementsByTagName('head')[0];

  const jsList: NodeListOf<HTMLElement> = jsRoot.querySelectorAll(`script[${PREFIX}=${tagData}]`);
  jsList.forEach(js => {
    jsRoot.removeChild(js);
  });

  const cssList: NodeListOf<HTMLElement> = cssRoot.querySelectorAll(`link[${PREFIX}=${tagData}]`);
  cssList.forEach(css => {
    cssRoot.removeChild(css);
  });
}

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

  let id: string = `${PREFIX}-js-${index}`;
  let type: string = 'script';

  if (isCss) {
    id = `${PREFIX}-css-${index}`;
    type = 'link';
  }

  let element: HTMLElement;

  element = document.createElement(type);
  element.id = id;
  element.setAttribute(PREFIX, tagData);

  if (isCss) {
    element.setAttribute('rel', 'stylesheet');
    element.setAttribute('href', url);
  } else {
    element.setAttribute('type', 'text/javascript');
    element.setAttribute('async', '');
    element.setAttribute('src', url);
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
