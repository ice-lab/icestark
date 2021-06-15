/* eslint no-underscore-dangle: ["error", { "allow": ["foo_", "_bar"], "allowAfterThis": true }] */
/* eslint import/no-mutable-exports: 'off' */

import { isObject, isArray, warn } from './utils';
import { setCache, getCache } from './cache';

const storeNameSpace = 'store';

type StringSymbolUnion = string | symbol;

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IO {
  set(key: string | symbol | object, value?: any): void;
  get(key?: StringSymbolUnion): void;
}

interface Hooks {
  on(key: StringSymbolUnion, callback: (value: any) => void, force?: boolean): void;
  off(key: StringSymbolUnion, callback?: (value: unknown) => void): void;
  has(key: StringSymbolUnion): boolean;
}

class Store implements IO, Hooks {
  store: object;

  storeEmitter: object;

  constructor() {
    this.store = {};
    this.storeEmitter = {};
  }

  _getValue(key: StringSymbolUnion) {
    return this.store[key];
  }

  _setValue(key: StringSymbolUnion, value: any) {
    this.store[key] = value;
    this._emit(key);
  }

  _emit(key: StringSymbolUnion) {
    const keyEmitter = this.storeEmitter[key];

    if (!isArray(keyEmitter) || (isArray(keyEmitter) && keyEmitter.length === 0)) {
      return;
    }

    const value = this._getValue(key);
    keyEmitter.forEach(cb => {
      cb(value);
    });
  }

  get(key?: StringSymbolUnion) {
    if (key === undefined) {
      return this.store;
    }

    if (typeof key !== 'string' && typeof key !== 'symbol') {
      warn(`store.get: key should be string / symbol`);
      return null;
    }

    return this._getValue(key);
  }

  set<T>(key: string | symbol | object, value?: T) {
    if (typeof key !== 'string'
      && typeof key !== 'symbol'
      && !isObject(key)) {
      warn('store.set: key should be string / symbol / object');
      return;
    }

    if (isObject(key)) {
      Object.keys(key).forEach(k => {
        const v = key[k];

        this._setValue(k, v);
      });
    } else {
      this._setValue(key as StringSymbolUnion, value);
    }
  }

  on(key: StringSymbolUnion, callback: (value: any) => void, force?: boolean) {
    if (typeof key !== 'string') {
      if (typeof key !== 'symbol') {
        warn('store.on: key should be string / symbol');
        return;
      }
    }

    if (callback === undefined || typeof callback !== 'function') {
      warn('store.on: callback is required, should be function');
      return;
    }

    if (!this.storeEmitter[key]) {
      this.storeEmitter[key] = [];
    }

    this.storeEmitter[key].push(callback);

    if (force) {
      callback(this._getValue(key));
    }
  }

  off(key: StringSymbolUnion, callback?: (value: any) => void) {
    if (typeof key !== 'string' && typeof key !== 'symbol') {
      warn('store.off: key should be string / symbol');
      return;
    }

    if (!isArray(this.storeEmitter[key])) {
      warn(`store.off: ${String(key)} has no callback`);
      return;
    }

    if (callback === undefined) {
      this.storeEmitter[key] = undefined;
      return;
    }

    this.storeEmitter[key] = this.storeEmitter[key].filter(cb => cb !== callback);
  }

  has(key: StringSymbolUnion) {
    const keyEmitter = this.storeEmitter[key];
    return isArray(keyEmitter) && keyEmitter.length > 0;
  }
}

let store = getCache(storeNameSpace);
if (!store) {
  store = new Store();
  setCache(storeNameSpace, store);
}

export default store;
