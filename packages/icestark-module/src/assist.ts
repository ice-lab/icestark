export function shallowCompare<T extends object>(source: T, target: T) {
  if (source === target) return true;
  if (!source || !target) return false;
  return Object.keys(source).every((key) => source[key] === target[key]);
}
