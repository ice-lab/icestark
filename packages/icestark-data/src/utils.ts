export function isObject(o: any): boolean {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function isArray(a: any): boolean {
  return Object.prototype.toString.call(a) === '[object Array]';
}

export function warn(message: string): void {
  return console && console.warn(message);
}
