import { PREFIX, STATIC } from '../constant';

/**
 * record static assets
 */
export default function recordAssets(): void {
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
