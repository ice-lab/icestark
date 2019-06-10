import 'react-testing-library/cleanup-after-each';
import 'jest-dom/extend-expect';

import * as React from 'react';
import { render } from 'react-testing-library';
import { AppRouter, AppRoute, AppLink } from '../src/index';

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
