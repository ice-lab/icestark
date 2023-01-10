export function shallowCompare<T extends object>(source: T, target: T) {
  if (source === target) return true;
  if (!source || !target) return false;

  for (const key in source) {
    if (source[key] !== target[key]) {
      return false;
    }
  }

  for (const key in target) {
    if (!(key in source)) {
      return false;
    }
  }

  return true;
}
