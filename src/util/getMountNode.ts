import { getCache } from './cache';

export default function getMountNode(element?: any): any {
  if (getCache('root')) {
    return getCache('root');
  }

  if (element) {
    // string treated as 'id'
    if (typeof element === 'string') {
      return document.querySelector(`#${element}`);
    }

    // function, return value
    if (typeof element === 'function') {
      return element();
    }

    return element;
  }
  const ICE_CONTAINER = document.querySelector('#ice-container');
  if (!ICE_CONTAINER) {
    throw new Error('Current page does not exist <div id="ice-container"></div> element.');
  }

  return ICE_CONTAINER;
}
