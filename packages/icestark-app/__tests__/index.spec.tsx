import '@testing-library/jest-dom/extend-expect';

import {
  getBasename,
  getMountNode,
  renderNotFound,
  registerAppEnter,
  registerAppLeave,
  appHistory,
  isInIcestark,
  setBasename,
} from '../src/index';
import { setCache, getCache } from '../src/cache';
import formatUrl from '../src/util/formatUrl';
import normalizeArgs from '../src/util/normalizeArgs';

const namespace = 'ICESTARK';

describe('cache', () => {
  test('cache', () => {
    expect(getCache('testCache')).toBeNull();

    setCache('testCache', 'this is a test');
    expect(getCache('testCache')).toBe('this is a test');
  });
});

describe('getBasename&setBasename', () => {
  test('getBasename', () => {
    expect(getBasename()).toBe('/');

    setCache('basename', '/test');

    expect(getBasename()).toBe('/test');

    setBasename('/test1');
    expect(getBasename()).toBe('/test1');
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

describe('registerAppEnter', () => {
  test('registerAppEnter', () => {
    expect(registerAppEnter()).toBeUndefined;

    const mockCallback = jest.fn();
    registerAppEnter(mockCallback);
    expect(getCache('appEnter')).toEqual(mockCallback);

    expect(function() {
      registerAppEnter('test' as any);
    }).toThrowError('registerAppEnter must be function.');
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

describe('isInIcestark', () => {
  test('isInIcestark', () => {
    window[namespace] = null;

    expect(isInIcestark()).toBe(false);

    window[namespace] = { root: null };
    expect(isInIcestark()).toBe(false);

    const div = document.createElement('div');
    div.setAttribute('id', 'ice-container');
    window[namespace] = { root: div };
    expect(isInIcestark()).toBe(true);
  });
});

describe('formatUrl', () => {
  test('formatUrl', () => {
    expect(formatUrl('/seller')).toBe('/seller');

    expect(formatUrl('#/seller')).toBe('#/seller');

    expect(formatUrl('/seller', true)).toBe('#/seller');
  })
});

describe('normalizeArgs', () => {
  test('normalizeArgs', () => {
    expect(normalizeArgs(true)).toEqual([{}, true]);
    expect(normalizeArgs(false, true)).toEqual([{}, true]);

    expect(normalizeArgs({ framework: 'icestark' })).toEqual([{ framework: 'icestark' }, undefined]);
    expect(normalizeArgs({ framework: 'icestark' }, true)).toEqual([{ framework: 'icestark' }, true]);
    expect(normalizeArgs({ framework: 'icestark' }, false)).toEqual([{ framework: 'icestark' }, false]);

    expect(normalizeArgs()).toEqual([{}, undefined]);
    expect(normalizeArgs(null)).toEqual([null, undefined]);
  })
});
