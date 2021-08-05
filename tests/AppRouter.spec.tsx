import * as fs from 'fs';
import * as path from 'path';
import '@testing-library/jest-dom/extend-expect';
import { FetchMock } from 'jest-fetch-mock';
import { getCache, setCache } from '../src/util/cache';
import * as React from 'react';
import { render } from '@testing-library/react';
import { AppRouter, AppRoute } from '../src/index';

describe('AppRouter', () => {
  const umdSourceWithSetLibrary = fs.readFileSync(path.resolve(__dirname, './umd-setlibrary-sample.js'));
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
    setCache('root', true);
  });

  test('app-basename-default', () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { unmount } = render(
      <AppRouter>
        <AppRoute
          path="/seller"
          title="小二"
          url={[
            '//icestark.com/index.js'
          ]}
        />
      </AppRouter>
    );
    window.history.pushState({}, 'test', '/seller');
    expect(getCache('basename')).toBe('/seller');
    unmount();
  })

  test('app-basename-custom', () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { unmount } = render(
      <AppRouter>
        <AppRoute
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
    expect(getCache('basename')).toBe('/seller-b');
    unmount();
  })

  test('app-basename-frameworkBasename', () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());
    const { unmount } = render(
      <AppRouter
        basename="/micro"
        >
        <AppRoute
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
    unmount();
  })
})