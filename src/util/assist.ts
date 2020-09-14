export interface PathData {
  value: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

/**
 * util function to covert path to string
 *
 * @export
 * @param {(string | (string | PathData)[])} list
 * @returns
 */
export function converArray2String(list: string | (string | PathData)[]) {
  if (Array.isArray(list)) {
    return list.map((item) => {
      if (Object.prototype.toString.call(item) === '[object Object]') {
        return Object.keys(item).map((key) => `${key}:${item[key]}`).join(',');
      }
      return item;
    }).join(',');
  }

  return String(list);
}