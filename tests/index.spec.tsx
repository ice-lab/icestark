import '@testing-library/react/cleanup-after-each';
import '@testing-library/jest-dom/extend-expect';

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { AppRouter, AppRoute, AppLink, appHistory } from '../src/index';
import matchPath from '../src/matchPath';
import { loadAssets, recordAssets } from '../src/handleAssets';
import { setCache, getCache } from '../src/cache';

describe('AppRouter', () => {
  test('render the AppRouter', () => {
    const props = {
      onRouteChange: jest.fn(),
      useShadow: false,
      NotFoundComponent: <div data-testid="icestarkDefalut">NotFound</div>,
    };
    const { getByTestId } = render(<AppRouter {...props} />);

    const textNode = getByTestId('icestarkDefalut');

    expect(textNode).toHaveTextContent('NotFound');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);

    window.history.pushState({}, 'test', '/#/test');
    expect(props.onRouteChange).toHaveBeenCalledTimes(2);

    window.history.replaceState({ forceRender: true }, 'test2', '/#/test2');
    expect(props.onRouteChange).toHaveBeenCalledTimes(3);
  });

  test('test for AppRoute Component', () => {
    window.history.pushState({}, 'test', '/');

    const props = {
      onRouteChange: jest.fn(),
      LoadingComponent: <div>Loading</div>,
    };

    const { container, rerender, unmount, getByText } = render(
      <AppRouter {...props}>
        <AppRoute path="/" component={<div data-testid="icestarkTest">test</div>} />
      </AppRouter>,
    );

    expect(container.innerHTML).toContain('test');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);

    rerender(
      <AppRouter {...props}>
        <AppRoute
          path="/"
          render={() => (
            <div data-testid="icestarkTest">
              test
              <button
                type="submit"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('icestark:not-found'));
                }}
              >
                Jump NotFound
              </button>
              <button
                type="submit"
                onClick={() => {
                  window.dispatchEvent(new PopStateEvent('popstate', {}));
                }}
              >
                Jump Hash
              </button>
            </div>
          )}
        />
      </AppRouter>,
    );

    expect(container.innerHTML).toContain('test');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText(/Jump NotFound/i));
    expect(container.innerHTML).toContain('NotFound');

    fireEvent.click(getByText(/Jump Hash/i));
    expect(props.onRouteChange).toHaveBeenCalledTimes(2);

    /**
     * test for HashType
     */
    rerender(
      <AppRouter {...props}>
        <AppRoute path="/" url={[]} hashType />
      </AppRouter>,
    );
    const appRouteNode = container.querySelector('.ice-stark-loading');
    expect(container.innerHTML).toContain('Loading');
    expect(appRouteNode.childNodes.length).toBe(2);

    /**
     * Load assets error
     */
    rerender(
      <AppRouter {...props}>
        <AppRoute path="/" url={['//icestark.com/js/index.js']} hashType="hashbang" />
      </AppRouter>,
    );
    expect(container.innerHTML).toContain('Loading');

    const dynamicScript = document.querySelector('[icestark=dynamic]');
    expect(dynamicScript.id).toBe('icestark-js-0');
    expect(dynamicScript.getAttribute('src')).toBe('//icestark.com/js/index.js');

    dynamicScript.dispatchEvent(new ErrorEvent('error'));
    expect(container.innerHTML).toContain('JS asset loaded error: //icestark.com/js/index.js');

    /**
     * Load assets success
     */
    setCache('appLeave', () => {});

    // HTMLElement.attachShadow = jest.fn();

    rerender(
      <AppRouter {...props}>
        <AppRoute path="/" url={['//icestark.com/js/index.js', '//icestark.com/css/index.css']} />
      </AppRouter>,
    );
    expect(getCache('appLeave')).toBeNull();

    // js load success
    const dynamicScriptLoaded = document.querySelector('script[icestark=dynamic]');
    expect(dynamicScriptLoaded.getAttribute('id')).toBe('icestark-js-0');
    expect(dynamicScriptLoaded.getAttribute('type')).toBe('text/javascript');
    expect(dynamicScriptLoaded.getAttribute('src')).toBe('//icestark.com/js/index.js');

    dynamicScriptLoaded.dispatchEvent(new Event('load'));
    expect(container.querySelector('.ice-stark-loading').childNodes.length).toBe(1);

    // css load success
    const dynamicLinkLoaded = document.querySelector('link[icestark=dynamic]');
    expect(dynamicLinkLoaded.getAttribute('id')).toBe('icestark-css-0');
    expect(dynamicLinkLoaded.getAttribute('rel')).toBe('stylesheet');
    expect(dynamicLinkLoaded.getAttribute('href')).toBe('//icestark.com/css/index.css');

    dynamicLinkLoaded.dispatchEvent(new Event('load'));
    expect(container.querySelector('.ice-stark-loaded').childNodes.length).toBe(1);

    unmount();
  });
});

describe('AppLink', () => {
  test('render the AppLink', () => {
    const className = 'ice-stark-test';
    const props = {
      to: '/test',
      className,
    };
    const TestText = 'This is a test';

    const { container, getByText, rerender } = render(<AppLink {...props}>{TestText}</AppLink>);
    const appLinkNode = container.querySelector(`.${className}`);

    expect(appLinkNode).toHaveTextContent(TestText);
    expect(appLinkNode).toHaveAttribute('href');

    const mockPushState = jest.fn();
    window.history.pushState = mockPushState;

    fireEvent.click(getByText(/This is a test/i));
    expect(mockPushState.mock.calls.length).toBe(1);

    rerender(
      <AppLink {...props} replace>
        {TestText}
      </AppLink>,
    );
    const mockReplaceState = jest.fn();
    window.history.replaceState = mockReplaceState;

    fireEvent.click(getByText(/This is a test/i));
    expect(mockReplaceState.mock.calls.length).toBe(1);
  });
});

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

describe('handleAssets', () => {
  test('loadAssets', () => {
    loadAssets(
      [
        'http://icestark.com/js/index.js',
        'http://icestark.com/css/index.css',
        'http://icestark.com/js/test1.js',
      ],
      false,
      jest.fn(),
      jest.fn(),
    );
    const jsElement0 = document.getElementById('icestark-js-0');
    const jsElement1 = document.getElementById('icestark-js-1');

    expect((jsElement0 as HTMLScriptElement).src).toEqual('http://icestark.com/js/index.js');
    expect((jsElement0 as HTMLScriptElement).async).toEqual(false);
    expect((jsElement1 as HTMLScriptElement).src).toEqual('http://icestark.com/js/test1.js');
    expect((jsElement1 as HTMLScriptElement).async).toEqual(false);

    recordAssets();

    expect(jsElement0.getAttribute('icestark')).toEqual('static');
    expect(jsElement1.getAttribute('icestark')).toEqual('static');
  });

  test('recordAssets', () => {
    const jsElement = document.createElement('script');
    jsElement.id = 'icestark-script';

    const linkElement = document.createElement('link');
    linkElement.id = 'icestark-link';

    const styleElement = document.createElement('style');
    styleElement.id = 'icestark-style';

    document.body.appendChild(jsElement);
    document.body.appendChild(linkElement);
    document.body.appendChild(styleElement);

    recordAssets();

    expect(jsElement.getAttribute('icestark')).toEqual('static');
    expect(linkElement.getAttribute('icestark')).toEqual('static');
    expect(styleElement.getAttribute('icestark')).toEqual('static');
  });
});

describe('appHistory', () => {
  test('appHistory', () => {
    const mockPushState = jest.fn();
    window.history.pushState = mockPushState;

    appHistory.push('/test');
    expect(mockPushState.mock.calls.length).toBe(1);

    const mockReplaceState = jest.fn();
    window.history.replaceState = mockReplaceState;

    appHistory.replace('/test');
    expect(mockReplaceState.mock.calls.length).toBe(1);
  });
});
