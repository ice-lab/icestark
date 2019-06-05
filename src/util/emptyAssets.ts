import { PREFIX, DYNAMIC, STATIC } from '../constant';
import { getIcestarkRoot } from './index';

/**
 * empty useless assets
 */
export default function emptyAssets(useShadow: boolean): void {
  const jsRoot: HTMLElement = document.getElementsByTagName('head')[0];
  const cssRoot: HTMLElement | ShadowRoot = useShadow
    ? getIcestarkRoot()
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
