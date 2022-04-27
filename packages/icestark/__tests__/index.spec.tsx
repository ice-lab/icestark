import '@testing-library/jest-dom/extend-expect';
import { FetchMock } from 'jest-fetch-mock';

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { AppRouter, AppRoute, AppLink, appHistory } from '../src/index';
import { IS_CSS_REGEX } from '../src/util/constant';

describe('AppRouter', () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  const defaultProps = {};

  test('render the AppRouter', () => {
    const props = {
      onRouteChange: jest.fn(),
      NotFoundComponent: <div data-testid="icestarkDefalut">NotFound</div>,
    };
    const { getByTestId, unmount } = render(<AppRouter {...props} />);

    const textNode = getByTestId('icestarkDefalut');

    expect(textNode).toHaveTextContent('NotFound');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);

    window.history.pushState({}, 'test', '/#/test');
    expect(props.onRouteChange).toHaveBeenCalledTimes(2);

    window.history.replaceState({}, 'test2', '/#/test2');
    expect(props.onRouteChange).toHaveBeenCalledTimes(3);
    unmount();
  });

  test('test for Only AppRoute Component', () => {
    window.history.pushState({}, 'test', '/render-component');
    const { container, unmount } = render(
      <AppRoute {...defaultProps} path="/render-component" component={<div data-testid="icestarkTest">test component</div>} />,
    );
    expect(container.innerHTML).toContain('test component');

    unmount();
  });

  test('test for Only AppRoute Render', () => {
    window.history.pushState({}, 'test', '/props-render');
    const { container, unmount } = render(
      <AppRoute {...defaultProps} path="/props-render" render={() => <div data-testid="icestarkTest">test render</div>} />,
    );
    expect(container.innerHTML).toContain('test render');

    unmount();
  });

  test('test for app basename', () => {
    window.history.pushState({}, 'test', '/');
    const { container, unmount, rerender } = render(
      <AppRouter basename="icestark-basename" NotFoundComponent={(<div>not found</div>)}>
        <AppRoute path='/' render={() => <div data-testid="icestarkTest">test render</div>} />
      </AppRouter>,
    );
    expect(container.innerHTML).toContain('not found');

    window.history.pushState({}, 'test', '/icestark-basename');
    rerender(
     <AppRouter basename="icestark-basename">
       <AppRoute path="/" render={() => <div data-testid="icestarkTest">test render</div>} />
     </AppRouter>,
   );
   expect(container.innerHTML).toContain('test render');

    window.history.pushState({}, 'test', '/icestark-basename/seller');
     rerender(
      <AppRouter basename="icestark-basename">
        <AppRoute path="/seller" render={() => <div data-testid="icestarkTest">test render</div>} />
      </AppRouter>,
    );
    expect(container.innerHTML).toContain('test render');

    unmount();
  });

  test('test for 404', () => {
    window.history.pushState({}, 'test', '/404');
    const { container, unmount } = render(
      <AppRouter>
        <AppRoute path="/notfound" render={() => <div data-testid="icestarkTest">test render</div>} />
      </AppRouter>,
    );
    expect(container.innerHTML).toContain('NotFound');
    unmount();
  });

  test('test for component update', () => {
    window.history.pushState({}, 'test', '/component-update');

    const props = {
      onAppEnter: jest.fn(),
      onAppLeave: jest.fn(),
    };

    const RenerComponent = (props) => {
      return (
        <div data-testid="icestarkTest">
          {props.location.pathname === '/component-update' ? 'test render a' : 'test render b'}
        </div>
      );
    };

    const { container, unmount } = render(
      <AppRouter {...props}>
        <AppRoute
          path="/component-update"
          title="component"
          component={<RenerComponent />}
        />
      </AppRouter>
    );
    expect(props.onAppEnter).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).toContain('test render a');

    window.history.pushState({}, 'test', '/component-update/b');
    expect(container.innerHTML).toContain('test render b');
    unmount();
    expect(props.onAppLeave).toHaveBeenCalledTimes(1);
  });

  test('test for render update', () => {
    window.history.pushState({}, 'test', '/render-update');
    const RenerComponent = (props) => {
      return (
        <div data-testid="icestarkTest">
          {props.location.pathname === '/render-update' ? 'test render a' : 'test render b'}
        </div>
      );
    };
    const { container, unmount } = render(
      <AppRouter>
        <AppRoute
          path="/render-update"
          title="component"
          render={(props) => <RenerComponent {...props} />}
        />
      </AppRouter>
    );
    expect(container.innerHTML).toContain('test render a');
    window.history.pushState({}, 'test', '/render-update/b');
    expect(container.innerHTML).toContain('test render b');
    unmount();
  });

  test('test for AppRoute entry -> success', done => {
    window.history.pushState({}, 'test', '/fetch-entry');

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
        <AppRoute path="/fetch-entry" entry="//icestark.com" />
      </AppRouter>,
    );
    setTimeout(function() {
      expect(container.innerHTML).toContain('<!--link /index.css processed by @ice/stark-->');
      expect(container.innerHTML).toContain('<!--script index.js replaced by @ice/stark-->');

      const scripts = container.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        scripts[i].dispatchEvent(new Event('load'));
      }
      unmount();
      done()
    }, 100);
  });

  test('test for AppRoute', () => {
    window.history.pushState({}, 'test', '/test-routerchange');

    const props = {
      onRouteChange: jest.fn(),
      LoadingComponent: <div>Loading</div>,
      onAppEnter: jest.fn(),
      onAppLeave: jest.fn(),
    };

    // Test for render
    const { container, rerender, unmount, getByText } = render(
      <AppRouter {...props}>
        <AppRoute
          path="/test-routerchange"
          exact
          title="component"
          render={() => <div data-testid="icestarkTest">test</div>}
        />
      </AppRouter>,
    );
    expect(container.innerHTML).toContain('test');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);
    expect(props.onAppEnter).toHaveBeenCalledTimes(1);

    rerender(
      <AppRouter {...props}>
        <AppRoute
          path="/test-routerchange"
          exact
          title="render"
          render={() => (
            <div data-testid="icestarkTest">
              testRender
              <button
                type="submit"
                onClick={() => {
                  window.history.pushState({}, 'test', '/test');
                }}
              >
                Jump 404
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

    expect(props.onAppLeave).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).toContain('testRender');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);
    expect(props.onAppEnter).toHaveBeenCalledTimes(2);

    fireEvent.click(getByText(/Jump Hash/i));
    // url do not change, will not trigger onRouteChange
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);

    fireEvent.click(getByText(/Jump 404/i));
    expect(props.onRouteChange).toHaveBeenCalledTimes(2);
    expect(props.onAppLeave).toHaveBeenCalledTimes(2);
    expect(container.innerHTML).toContain('NotFound');

    // Test for HashType
    window.history.pushState({}, 'test', '/');
    rerender(
      <AppRouter {...props}>
        <AppRoute path="/" title="empty" url={['//icestark.com/js/index.js']} hashType />
      </AppRouter>,
    );

    const appRouteNode = container.querySelector('.ice-stark-loading');
    expect(container.innerHTML).toContain('Loading');
    expect(appRouteNode.childNodes.length).toBe(1);
    unmount();
  });

  test('test for AppRoute entry -> error', done => {
    window.history.pushState({}, 'test', '/testerror');

    const props = {
      onRouteChange: jest.fn(),
      LoadingComponent: <div>Loading</div>,
    };

    const err = 'err';
    (fetch as FetchMock).mockRejectOnce(err as any as Error);

    const { unmount, container } = render(
      <AppRouter {...props}>
        <AppRoute path="/testerror" exact entry="//icestark.com" />
      </AppRouter>,
    );

    setTimeout(function() {
      expect(container.innerHTML).toContain('err');
      unmount();
      done();
    }, 100)
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

  test('message of AppLink', () => {
    window.confirm = () => false;
    const { getByText } = render(<AppLink to="/test-message" message="test">click</AppLink>);
    const mockReplaceState = jest.fn();
    window.history.replaceState = mockReplaceState;
    fireEvent.click(getByText(/click/i));
    expect(mockReplaceState.mock.calls.length).toBe(0);
  })
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
