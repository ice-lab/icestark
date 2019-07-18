import 'react-testing-library/cleanup-after-each';
import 'jest-dom/extend-expect';

import * as React from 'react';
import { render } from 'react-testing-library';
import {
  AppRouter,
  AppRoute,
  AppLink,
  getBasename,
  getMountNode,
  renderNotFound,
} from '../src/index';
import matchPath from '../src/util/matchPath';
import loadAssets from '../src/util/loadAssets';

describe('AppRouter', () => {
  test('render the AppRouter', () => {
    const props = {
      onRouteChange: jest.fn(),
      useShadow: false,
      NotFoundComponent: <div data-testid="icestarkDefalut">NotFound</div>,
    };
    const { container, getByTestId } = render(<AppRouter {...props} />);

    const appRouteNode = container.querySelector('.ice-stark-loaded');
    const textNode = getByTestId('icestarkDefalut');

    expect(appRouteNode.childNodes.length).toBe(2);
    expect(textNode).toHaveTextContent('NotFound');
    expect(props.onRouteChange).toHaveBeenCalledTimes(1);
  });
});

describe('AppRoute', () => {
  test('render the AppRoute', () => {
    const props = {
      path: '/',
      url: [],
      title: '主页',
      useShadow: false,
      LoadingComponent: <div>Loading</div>,
    };
    const { container } = render(<AppRoute {...props} />);

    const appRouteNode = container.querySelector('.ice-stark-loading');
    expect(appRouteNode.childNodes.length).toBe(2);
  });

  test('render the AppRoute without LoadingComponent', () => {
    const props = {
      path: '/',
      url: [],
      title: '主页',
      useShadow: false,
    };
    const { container } = render(<AppRoute {...props} />);

    const appRouteNode = container.querySelector('.ice-stark-loading');
    expect(appRouteNode.childNodes.length).toBe(1);
  });
});

describe('AppLink', () => {
  test('render the AppLink', () => {
    const className = 'ice-stark-test';
    const props = {
      to: 'www.taobao.com',
      className,
    };
    const TestText = 'This is a test';

    const { container } = render(<AppLink {...props}>{TestText}</AppLink>);
    const appLinkNode = container.querySelector(`.${className}`);

    expect(appLinkNode).toHaveTextContent(TestText);
    expect(appLinkNode).toHaveAttribute('href');
  });
});

describe('getBasename', () => {
  test('getBasename', () => {
    expect(getBasename()).toBe('/');
  });
});

describe('getMountNode', () => {
  test('getMountNode', () => {
    expect(function() {
      getMountNode();
    }).toThrowError('Current page does not exist <div id="ice-container"></div> element.');
  });
});

describe('renderNotFound', () => {
  test('renderNotFound', () => {
    expect(renderNotFound()).toBe('Current sub-application is running independently');
  });
});

describe('matchPath', () => {
  test('matchPath', () => {
    expect(matchPath('/test/123', { path: '/test' })).not.toBeNull();
    expect(matchPath('/test/123', { path: '/test/:id' })).not.toBeNull();
    expect(matchPath('/test/123', { path: '/test', exact: true })).toBeNull();
  });
});

describe('loadAssets', () => {
  test('loadAssets', () => {
    loadAssets(
      [
        'http://icestark.com/test.js',
        'http://icestark.com/test.css',
        'http://icestark.com/test1.js',
      ],
      false,
      jest.fn(),
      jest.fn(),
    );
    const jsElement0 = document.getElementById('icestark-js-0');
    const jsElement1 = document.getElementById('icestark-js-1');

    expect((jsElement0 as HTMLScriptElement).src).toEqual('http://icestark.com/test.js');
    expect((jsElement0 as HTMLScriptElement).async).toEqual(false);
    expect((jsElement1 as HTMLScriptElement).src).toEqual('http://icestark.com/test1.js');
    expect((jsElement1 as HTMLScriptElement).async).toEqual(false);
  });
});
