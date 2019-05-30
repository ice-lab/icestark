import { getIcestark } from './constant';

export default function getMountNode(element: any): any {
  if (getIcestark('root')) {
    return getIcestark('root');
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
    throw new Error('当前页面不存在 <div id="ice-container"></div> 节点.');
  }

  return ICE_CONTAINER;
}

export const getIcestarkRoot = () => getIcestark('root');
