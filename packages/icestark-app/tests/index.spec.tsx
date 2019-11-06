import '@testing-library/jest-dom/extend-expect';

import {
  getBasename,
  getMountNode,
  renderNotFound,
  registerAppLeave,
  appHistory,
} from '../src/index';
import { setCache, getCache } from '../src/cache';

describe('setCache', () => {
  test('setCache', () => {
    expect(setCache('testKey', 123)).toBeUndefined;

    setCache('testKey', 123);
    expect(getCache('testKey')).toBe(123);
  });
});

describe('getBasename', () => {
  test('getBasename', () => {
    expect(getBasename()).toBe('/');

    setCache('basename', '/test');

    expect(getBasename()).toBe('/test');
  });
});

describe('getMountNode', () => {
  test('getMountNode', () => {
    document.body.innerHTML = '<div id="ice-container"></div>';

    setCache('root', document.querySelector('#ice-container'));
    expect(getMountNode()).toBeInTheDocument;

    setCache('root', null);

    expect(getMountNode()).toBeInTheDOM;

    expect(getMountNode('ice-container')).toBeInTheDOM;

    expect(getMountNode(() => '123')).toBe('123');

    expect(getMountNode([])).toEqual([]);

    expect(function() {
      document.body.innerHTML = '<div id="ice-test"></div>';
      getMountNode();
    }).toThrowError('Current page does not exist <div id="ice-container"></div> element.');
  });
});

describe('renderNotFound', () => {
  test('renderNotFound', () => {
    expect(renderNotFound()).toBe('Current sub-application is running independently');

    document.body.innerHTML = '<div id="ice-container"></div>';

    setCache('root', document.querySelector('#ice-container'));

    const mockCallback = jest.fn();
    window.addEventListener('icestark:not-found', mockCallback);

    expect(renderNotFound()).toBeNull;

    expect(mockCallback.mock.calls.length).toBe(1);
  });
});

describe('registerAppLeave', () => {
  test('registerAppLeave', () => {
    expect(registerAppLeave()).toBeUndefined;

    const mockCallback = jest.fn();
    registerAppLeave(mockCallback);
    expect(getCache('appLeave')).toEqual(mockCallback);

    expect(function() {
      registerAppLeave('test' as any);
    }).toThrowError('registerAppLeave must be function.');
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
