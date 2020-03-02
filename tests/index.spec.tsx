import '@testing-library/jest-dom/extend-expect';
import { FetchMock } from 'jest-fetch-mock';

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { AppRouter, AppRoute, AppLink, appHistory } from '../src/index';
import { setCache } from '../src/util/cache';
import { IS_CSS_REGEX } from '../src/util/constant';

describe('AppRouter', () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  test('render the AppRouter', () => {
    const props = {
      onRouteChange: jest.fn(),
      NotFoundComponent: <div data-testid="icestarkDefalut">NotFound</div>,
    };
    const { getByTestId } = render(<AppRouter {...props} />);

    const textNode = getByTestId('icestarkDefalut');

    expect(textNode).toHaveTextContent('NotFound');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);

    window.history.pushState({}, 'test', '/#/test');
    expect(props.onRouteChange).toHaveBeenCalledTimes(2);

    window.history.replaceState({}, 'test2', '/#/test2');
    expect(props.onRouteChange).toHaveBeenCalledTimes(3);
  });

  test('test for AppRoute', () => {
    window.history.pushState({}, 'test', '/');

    const props = {
      onRouteChange: jest.fn(),
      LoadingComponent: <div>Loading</div>,
    };

    /**
     * Test for render
     */
    const { container, rerender, unmount, getByText } = render(
      <AppRouter {...props}>
        <AppRoute
          path="/"
          title="component"
          component={<div data-testid="icestarkTest">test</div>}
        />
      </AppRouter>,
    );

    expect(container.innerHTML).toContain('test');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);

    rerender(
      <AppRouter {...props}>
        <AppRoute
          path="/"
          title="render"
          render={() => (
            <div data-testid="icestarkTest">
              testRender
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

    expect(container.innerHTML).toContain('testRender');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText(/Jump Hash/i));
    expect(props.onRouteChange).toHaveBeenCalledTimes(2);

    fireEvent.click(getByText(/Jump NotFound/i));
    expect(container.innerHTML).toContain('NotFound');

    /**
     * Test for HashType
     */
    window.history.pushState({}, 'test', '/');

    setCache('appLeave', () => {});
    rerender(
      <AppRouter {...props}>
        <AppRoute path="/" title="empty" url={[]} hashType />
      </AppRouter>,
    );

    const appRouteNode = container.querySelector('.ice-stark-loading');
    expect(container.innerHTML).toContain('Loading');
    expect(appRouteNode.childNodes.length).toBe(1);
    unmount();
  });

  test('test for AppRoute url -> error', done => {
    window.history.pushState({}, 'test', '/');

    const props = {
      onRouteChange: jest.fn(),
      LoadingComponent: <div>Loading</div>,
    };

    const { container, unmount } = render(
      <AppRouter {...props}>
        <AppRoute path="/" url={['//icestark.com/js/index.js']} hashType="hashbang" />
      </AppRouter>,
    );

    expect(container.innerHTML).toContain('Loading');

    setTimeout(function() {
      unmount();
    }, done());
  });

  test('test for AppRoute url -> success', () => {
    window.history.pushState({}, 'test', '/');

    const props = {
      onRouteChange: jest.fn(),
      LoadingComponent: <div>Loading</div>,
    };

    const { unmount } = render(
      <AppRouter {...props}>
        <AppRoute
          path="/"
          url={['//icestark.com/js/index.js', '//icestark.com/css/index.css']}
          useShadow={false}
        />
      </AppRouter>,
    );
    unmount();
  });

  test('test for AppRoute entry -> success', done => {
    window.history.pushState({}, 'test', '/');

    const props = {
      onRouteChange: jest.fn(),
      LoadingComponent: <div>Loading</div>,
    };

    (fetch as FetchMock).mockResponseOnce(
      '<html>' +
        '  <head>' +
        '    <meta charset="utf-8" />' +
        '    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />' +
        '    <link rel="dns-prefetch" href="//g.alicdn.com" />' +
        '    <link rel="stylesheet" href="/index.css" />' +
        '    <title>This is for test</title>' +
        '  </head>' +
        '  <body>' +
        '    <div id="App">' +
        '    </div>' +
        '    <script src="index.js"></script>' +
        '    <div id="page_bottom"></div>' +
        '  </body>' +
        '</html>',
    );

    const { container, unmount } = render(
      <AppRouter {...props}>
        <AppRoute path="/" entry="//icestark.com" />
      </AppRouter>,
    );

    setTimeout(function() {
      expect(container.innerHTML).toContain('Loading');
      expect(container.innerHTML).toContain('<!--link /index.css processed by @ice/stark-->');
      expect(container.innerHTML).toContain('<!--script index.js replaced by @ice/stark-->');

      const scripts = container.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        scripts[i].dispatchEvent(new Event('load'));
      }

      unmount();
    }, done());
  });

  test('test for AppRoute entry -> error', () => {
    window.history.pushState({}, 'test', '/');

    const props = {
      onRouteChange: jest.fn(),
      LoadingComponent: <div>Loading</div>,
    };

    const err = new Error('err');
    (fetch as FetchMock).mockRejectOnce(err);

    const { unmount } = render(
      <AppRouter {...props}>
        <AppRoute path="/" entry="//icestark.com" />
      </AppRouter>,
    );

    unmount();
  });

  test('test for Only AppRoute Component', () => {
    window.history.pushState({}, 'test', '/');
    const { container, unmount } = render(
      <AppRoute path="/" component={<div data-testid="icestarkTest">test component</div>} />,
    );
    expect(container.innerHTML).toContain('test component');
    unmount();
  });

  test('test for Only AppRoute Render', () => {
    window.history.pushState({}, 'test', '/');
    const { container, unmount } = render(
      <AppRoute path="/" render={() => <div data-testid="icestarkTest">test render</div>} />,
    );
    expect(container.innerHTML).toContain('test render');
    unmount();
  });

  test('test for app basename', () => {
    window.history.pushState({}, 'test', '/icestark');
    const { container, unmount } = render(
      <AppRouter basename="icestark">
        <AppRoute path="/" render={() => <div data-testid="icestarkTest">test render</div>} />
      </AppRouter>,
    );
    expect(container.innerHTML).toContain('test render');
  });

  test('test for component update', () => {
    window.history.pushState({}, 'test', '/');
    const RenerComponent = (props) => {
      return (
        <div data-testid="icestarkTest">
          {props.location.pathname === '/' ? 'test render a' : 'test render b'}
        </div>
      );
    };
    
    const { container, unmount } = render(
      <AppRouter>
        <AppRoute
          path="/"
          title="component"
          component={<RenerComponent />}
        />
      </AppRouter>
    );
    expect(container.innerHTML).toContain('test render a');
    window.history.pushState({}, 'test', '/b');
    expect(container.innerHTML).toContain('test render b');
    unmount();
  });

  test('test for render update', () => {
    window.history.pushState({}, 'test', '/');
    const RenerComponent = (props) => {
      return (
        <div data-testid="icestarkTest">
          {props.location.pathname === '/' ? 'test render a' : 'test render b'}
        </div>
      );
    };
    
    const { container, unmount } = render(
      <AppRouter>
        <AppRoute
          path="/"
          title="component"
          render={(props) => <RenerComponent {...props} />}
        />
      </AppRouter>
    );
    expect(container.innerHTML).toContain('test render a');
    window.history.pushState({}, 'test', '/b');
    expect(container.innerHTML).toContain('test render b');
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
  test('hashType of AppLink', () => {
    const className = 'link-node';
    const { container } = render(<AppLink className={className} to="/test" hashType>link</AppLink>);
    const appLinkNode = container.querySelector(`.${className}`);
    expect(appLinkNode.getAttribute('href')).toBe('/#/test');
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

describe('IS_CSS_REGEX', () => {
  test('IS_CSS_REGEX', () => {
    expect(IS_CSS_REGEX.test('//icestark.com/index.css')).toBe(true);
    expect(IS_CSS_REGEX.test('//icestark.com/index.css?timeSamp=1575443657834')).toBe(true);
    expect(IS_CSS_REGEX.test('//icestark.com/index.css?query=test.js')).toBe(false);
  });
});
