import '@testing-library/jest-dom/extend-expect';
import matchPath from '../src/util/matchPath';

describe('matchPath', () => {
  test('matchPath', () => {
    let match = matchPath('/test/123');
    expect(match).toBeNull();

    match = matchPath('/test/123', '/test');
    expect(match.url).toBe('/test');

    match = matchPath('/test/123', { path: '/test' });
    expect(match.url).toBe('/test');

    match = matchPath('/test/123', { path: '/test/:id' });
    expect(match.url).toBe('/test/123');
    expect(match.params.id).toBe('123');

    match = matchPath('/test/123', { path: ['/test/:id', '/test/:id/detail'] });
    expect(match.url).toBe('/test/123');
    expect(match.path).toBe('/test/:id');
    expect(match.params.id).toBe('123');

    match = matchPath('/test/123', { path: '/test', exact: true });
    expect(match).toBeNull();
  });
});
