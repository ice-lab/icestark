import * as fs from 'fs';
import * as path from 'path';
import { FetchMock } from 'jest-fetch-mock';
import * as React from 'react';
import { render } from '@testing-library/react';
import { createMicroApp, unmountMicroApp } from '../src/apps';
import { setCache, getCache } from '../src/util/cache';

describe('createMicroApp', () => {
  const umdSourceWithSetLibrary = fs.readFileSync(path.resolve(__dirname, './umd-setlibrary-sample.js'));
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
    setCache('basename', '');
  });

  // before 2.5.0, createMicroApp did not support basename
  test('old-app-basename', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());

    const { getByTestId, container, unmount } = render(<div data-testid="container"></div>)

    // use setBasename instead
    setCache('basename', '/seller');

    await createMicroApp({
      name: 'waiter',
      url:[
        '//icestark.com/index.js'
      ],
      container: getByTestId('container'),
      loadScriptMode: "fetch"
    })

    console.log('fsdff', getCache('basename'))
    expect(getCache('basename')).toEqual('/seller');
    expect(!!getCache('root')).toBeTruthy();
    expect(container.innerHTML).toContain('商家列表')

    unmountMicroApp('waiter')
    unmount();
  })

  test('app-basename', async () => {
    (fetch as FetchMock).mockResponseOnce(umdSourceWithSetLibrary.toString());

    const { getByTestId, container, unmount } = render(<div data-testid="container"></div>)
    await createMicroApp({
      name: 'seller',
      basename: "seller",
      url:[
        '//icestark.com/index.js'
      ],
      container: getByTestId('container'),
      loadScriptMode: "fetch"
    })

    expect(getCache('basename')).toEqual('/seller');
    expect(!!getCache('root')).toBeTruthy();
    expect(container.innerHTML).toContain('商家列表');

    unmountMicroApp('seller');
    unmount();
  })
})
