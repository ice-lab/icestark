import '@testing-library/jest-dom/extend-expect';
import checkActive, { matchPath, getPathname } from '../src/util/checkActive';

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
    expect(checkFnc('/test/123')).toBeTruthy();

    // type `string`
    checkFnc = checkActive('/test', {});
    expect(checkFnc('/test/123')).toBeTruthy();

    checkFnc = checkActive('/test', { exact: true });
    expect(checkFnc('/test/123')).toBeFalsy();

    // type `string[]`
    checkFnc = checkActive(['/test', '/seller'], {});
    expect(checkFnc('/test/123')).toBeTruthy();

    checkFnc = checkActive(['/test', '/seller'], { exact: true });
    expect(checkFnc('/test/123')).toBeFalsy();

    // type `PathData`
    checkFnc = checkActive({ value: '/test' });
    debugger
    expect(checkFnc('/test/123')).toBeTruthy();

    checkFnc = checkActive({ value: '/test', exact: true });
    expect(checkFnc('/test/123')).toBeFalsy();

    // type `PathData[]`
    checkFnc = checkActive([{ value: '/test' }, { value: '/seller' }]);
    expect(checkFnc('/test/123')).toBeTruthy();

    // type `MixedPathData`
    checkFnc = checkActive(['/test', { value: '/seller' }]);
    expect(checkFnc('/test/123')).toBeTruthy();

    // type `ActiveFn`
    checkFnc = checkActive((url: string) => url.includes('/test'));
    expect(checkFnc('/test/123')).toBeTruthy();
  })
});
