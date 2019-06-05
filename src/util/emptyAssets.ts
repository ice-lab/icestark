import { PREFIX, DYNAMIC } from '../constant';
import { getIcestarkRoot } from './index';

/**
 * empty useless assets
 */
export default function emptyAssets(useShadow: boolean): void {
  const jsRoot: HTMLElement = document.getElementsByTagName('head')[0];
  const cssRoot: HTMLElement | ShadowRoot = useShadow
    ? getIcestarkRoot()
    : document.getElementsByTagName('head')[0];

  const jsList: NodeListOf<HTMLElement> = jsRoot.querySelectorAll(`script[${PREFIX}=${DYNAMIC}]`);
  jsList.forEach(js => {
    jsRoot.removeChild(js);
  });

  const cssList: NodeListOf<HTMLElement> = cssRoot.querySelectorAll(`link[${PREFIX}=${DYNAMIC}]`);
  cssList.forEach(css => {
    cssRoot.removeChild(css);
  });
}
