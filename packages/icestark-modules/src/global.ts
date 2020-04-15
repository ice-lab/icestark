// fork: https://github.com/systemjs/systemjs/blob/master/src/extras/global.js

// safari unpredictably lists some new globals first or second in object order
let firstGlobalProp;
let secondGlobalProp;
let lastGlobalProp;
const isIE11 = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Trident') !== -1;

function shouldSkipProperty(p) {
  // eslint-disable-next-line no-prototype-builtins
  return !global.hasOwnProperty(p)
    || !isNaN(p) && p < (global as any).length
    || isIE11 && global[p] && typeof window !== 'undefined' && global[p].parent === window;
}

export function getGlobalProp () {
  let cnt = 0;
  let lastProp;
  // eslint-disable-next-line no-restricted-syntax
  for (const p in global) {
    // do not check frames cause it could be removed during import
    if (shouldSkipProperty(p))
      // eslint-disable-next-line no-continue
      continue;
    if (cnt === 0 && p !== firstGlobalProp || cnt === 1 && p !== secondGlobalProp)
      return p;
    cnt++;
    lastProp = p;
  }
  if (lastProp !== lastGlobalProp)
    return lastProp;
}

export function noteGlobalProps () {
  // alternatively Object.keys(global).pop()
  // but this may be faster (pending benchmarks)
  firstGlobalProp = undefined;
  secondGlobalProp = undefined;
  // eslint-disable-next-line no-restricted-syntax
  for (const p in global) {
    // do not check frames cause it could be removed during import
    if (shouldSkipProperty(p))
      // eslint-disable-next-line no-continue
      continue;
    if (!firstGlobalProp)
      firstGlobalProp = p;
    else if (!secondGlobalProp)
      secondGlobalProp = p;
    lastGlobalProp = p;
  }
  return lastGlobalProp;
}
