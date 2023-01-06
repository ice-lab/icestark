import * as fs from 'fs';
import * as path from 'path';
import '@testing-library/jest-dom/extend-expect';
import { FetchMock } from 'jest-fetch-mock';
import { getCache, setCache } from '../src/util/cache';
import * as React from 'react';
import { render } from '@testing-library/react';
import { AppRouter, AppRoute } from '../src/index';
import { getMicroApps } from '../src/apps';

const delay = (milliscond: number) => new Promise(resolve => setTimeout(resolve, milliscond));

describe('AppRouter', () => {
  const umdSourceWithSetLibrary = fs.readFileSync(path.resolve(__dirname, './umd-setlibrary-sample.js'));
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
    setCache('basename', '');
  });

  test('app-basename-default', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { container, unmount } = render(
      <AppRouter>
        <AppRoute
          loadScriptMode="fetch"
          name="seller"
          path="/seller"
          title="小二"
          url={[
            '//icestark.com/index.js'
          ]}
        />
      </AppRouter>
    );
    window.history.pushState({}, 'test', '/seller');
    expect(container.innerHTML).toContain('Loading')
    expect(getCache('basename')).toBe('/seller');

    await delay(1000);
    expect(container.innerHTML).toContain('商家平台')

    window.history.pushState({}, 'test', '/seller/detail');
    await delay(1000);
    expect(container.innerHTML).toContain('商家详情')

    unmount();
  })

  test('app-basename-custom', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { container, unmount } = render(
      <AppRouter>
        <AppRoute
          loadScriptMode="fetch"
          name="seller"
          path="/seller"
          basename="/seller-b"
          title="小二"
          url={[
            '//icestark.com/index.js'
          ]}
        />
      </AppRouter>
    );
    window.history.pushState({}, 'test', '/seller');
    expect(container.innerHTML).toContain('Loading')
    expect(getCache('basename')).toBe('/seller-b');

    await delay(1000);
    expect(container.innerHTML).toContain('NotFound')

    unmount();
  })

  test('app-basename-empty', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { container, unmount } = render(
      <AppRouter>
        <AppRoute
          loadScriptMode="fetch"
          name="seller"
          path="/seller"
          basename=""
          title="小二"
          url={[
            '//icestark.com/index.js'
          ]}
        />
      </AppRouter>
    );
    window.history.pushState({}, 'test', '/seller');
    expect(container.innerHTML).toContain('Loading')
    expect(getCache('basename')).toBe('/seller');

    await delay(1000);
    expect(container.innerHTML).toContain('商家平台')
    unmount();
  })

  test('app-basename-frameworkBasename', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { container, unmount } = render(
      <AppRouter
        basename="/micro"
        >
        <AppRoute
          loadScriptMode="fetch"
          path="/seller"
          title="小二"
          url={[
            '//icestark.com/index.js'
          ]}
        />
      </AppRouter>
    );
    window.history.pushState({}, 'test', '/micro/seller');
    expect(getCache('basename')).toBe('/micro/seller');

    await delay(1000);
    expect(container.innerHTML).toContain('商家平台')

    unmount();
  })

  test('app-multi-paths', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { container, unmount } = render(
      <AppRouter>
        <AppRoute
          loadScriptMode="fetch"
          name="seller"
          path={["/seller", "/seller2"]}
          title="小二"
          url={[
            '//icestark.com/index.js'
          ]}
        />
      </AppRouter>
    );
    window.history.pushState({}, 'test', '/seller2');
    expect(container.innerHTML).toContain('Loading')
    expect(getCache('basename')).toBe('/seller2');

    await delay(1000);
    expect(container.innerHTML).toContain('商家平台')

    unmount();
  })

  test('app-cached', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { container, unmount } = render(
      <AppRouter>
        <AppRoute
          loadScriptMode="fetch"
          cached
          name="seller"
          path="/seller"
          title="小二"
          url={[
            '//icestark.com/index.js'
          ]}
        />
      </AppRouter>
    );
    window.history.pushState({}, 'test', '/seller');

    await delay(1000);
    expect(container.innerHTML).toContain('商家平台')

    window.history.pushState({}, 'test', '/waiter');
    await delay(1000);

    const app = getMicroApps().find(app => app.name === 'seller');
    expect(app.status).toEqual('UNMOUNTED');
    expect(!!app.mount).toBeTruthy();
    expect(!!app.unmount).toBeTruthy();

    unmount();
  })

  test('app-className-custom', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { container, unmount } = render(
      <AppRouter className="ice-app-router-custom">
        <AppRoute
          loadScriptMode="fetch"
          name="seller"
          path="/seller"
          title="小二"
          url={[
            '//icestark.com/index.js'
          ]}
        />
      </AppRouter>
    );

    window.history.pushState({}, 'test', '/seller');
    await delay(1000);

    expect(container.querySelector('.ice-app-router-custom')).toBeTruthy();

    unmount();
  })
})
