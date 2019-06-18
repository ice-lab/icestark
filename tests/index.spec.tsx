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
import { func } from 'prop-types';

describe('AppRouter', () => {
  test('render the AppRouter', () => {
    const props = {
      onRouteChange: jest.fn(),
      useShadow: false,
      NotFoundComponent: <div data-testid="icestarkDefalut">NotFound</div>,
    };
    const { container, getByTestId } = render(<AppRouter {...props} />);

    const appRouteNode = container.querySelector('#icestarkNode');
    const textNode = getByTestId('icestarkDefalut');

    expect(appRouteNode.className).toBe('ice-stark-loaded');
    expect(appRouteNode.childNodes.length).toBe(1);
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
    };
    const { container } = render(<AppRoute {...props} />);

    const appRouteNode = container.querySelector('#icestarkNode');
    expect(appRouteNode.className).toBe('ice-stark-loading');
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
