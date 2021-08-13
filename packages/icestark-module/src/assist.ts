export function shallowCompare<T extends object>(source: T, target: T) {
  return Object.keys(source).every((key) => source[key] === target[key]);
}
