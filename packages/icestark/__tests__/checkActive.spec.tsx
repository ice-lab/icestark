import '@testing-library/jest-dom/extend-expect';
import checkActive, { matchPath, getPathname, formatPath } from '../src/util/checkActive';

describe('checkActive', () => {
  test('matchPath - path options', () => {
    let match = matchPath('/test/123', { value: '/test' });
    expect(match && match.url).toBe('/test');

    match = matchPath('/test/123', { value: '/test/:id'  });
    expect(match && match.url).toBe('/test/123');
    expect(match && match.params.id).toBe('123');

    // test exact
    match = matchPath('/test/123', {  value: '/test', exact: true });
    expect(match).toBeFalsy();

    match = matchPath('/test/123', { value: '/test',  exact: true });
    expect(match).toBeFalsy();

    // test sensitive
    match = matchPath('/Test/123', { value: '/test',  sensitive: false });
    expect(match && match.url) .toBe('/Test');

    match = matchPath('/Test/123', { value: '/test',  sensitive: true });
    expect(match).toBeFalsy();

    // test strict
    match = matchPath('/test', { value: '/test/',  strict: false });
    expect(match && match.url) .toBe('/test');

    match = matchPath('/test', { value: '/test/',  strict: true });
    expect(match).toBeFalsy();

  });

  test('getPathname', () => {
    let pathname = getPathname('/test/123');
    expect(pathname).toBe('/test/123');

    pathname = getPathname('/test/#home')
    expect(pathname).toBe('/test/');

    pathname = getPathname('/test/#home', true)
    expect(pathname).toBe('/home');
  })

  test('matchPath - hashType', () => {
    let match = matchPath('/test/123', { value: '/test', hashType: true });
    expect(match).toBeFalsy();

    match = matchPath('/test/#home', { value: '/home', hashType: true });
    expect(match && match.url).toBe('/home');
  })

  test('checkActive', () => {
    // empty activePath
    let checkFnc = checkActive();
    expect(checkFnc('/test/123')[0]).toBeTruthy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    // type `string`
    checkFnc = checkActive(formatPath('/test', {}));
    expect(checkFnc('/test/123')[0]).toBeTruthy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    checkFnc = checkActive(formatPath('/test', { exact: true }));
    expect(checkFnc('/test/123')[0]).toBeFalsy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    // type `string[]`
    checkFnc = checkActive(formatPath(['/test', '/seller'], {}));
    expect(checkFnc('/test/123')[0]).toBeTruthy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    checkFnc = checkActive(formatPath(['/test', '/seller'], { exact: true }));
    expect(checkFnc('/test/123')[0]).toBeFalsy();
    expect(checkFnc('/test/123')[1]).toEqual(1);

    // type `PathData`
    checkFnc = checkActive(formatPath({ value: '/test' }, {}));
    expect(checkFnc('/test/123')[0]).toBeTruthy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    checkFnc = checkActive(formatPath({ value: '/test', exact: true }, {}));
    expect(checkFnc('/test/123')[0]).toBeFalsy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    // type `PathData[]`
    checkFnc = checkActive([{ value: '/test' }, { value: '/seller' }]);
    expect(checkFnc('/test/123')[0]).toBeTruthy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    // type `MixedPathData`
    checkFnc = checkActive(formatPath(['/test', { value: '/seller' }]));
    expect(checkFnc('/test/123')[0]).toBeTruthy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    // type `ActiveFn`
    checkFnc = checkActive((url: string) => url.includes('/test'));
    expect(checkFnc('/test/123')[0]).toBeTruthy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    // `undefined`
    checkFnc = checkActive(formatPath());
    expect(checkFnc('/test/123')[0]).toBeTruthy();
    expect(checkFnc('/test/123')[1]).toEqual(0);

    // matched idx
    checkFnc = checkActive(formatPath(['/test', '/seller'], {}));
    expect(checkFnc('/seller')[0]).toBeTruthy();
    expect(checkFnc('/seller')[1]).toEqual(1);
  })
});
