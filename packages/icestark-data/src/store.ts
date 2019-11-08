import { isObject, isArray, warn } from './utils';
import { setCache, getCache } from './cache';

const storeNameSpace = 'store';

interface IO {
  set(key: any, value?: any): void;
  get(key?: string): void;
}

interface Hooks {
  on(key: string, callback: (value: any) => void, force?: boolean): void;
  off(key: string, callback?: (value: any) => void): void;
  has(key: string): boolean;
}

class Store implements IO, Hooks {
  store: object;

  storeEmitter: object;

  constructor() {
    this.store = {};
    this.storeEmitter = {};
  }

  _getValue(key: string) {
    return this.store[key];
  }

  _setValue(key: string, value: any) {
    this.store[key] = value;
    this._emit(key);
  }

  _emit(key) {
    const keyEmitter = this.storeEmitter[key];

    if (!isArray(keyEmitter) || (isArray(keyEmitter) && keyEmitter.length === 0)) {
      return;
    }

    const value = this._getValue(key);
    keyEmitter.forEach(cb => {
      cb(value);
    });
  }

  get(key?: string) {
    if (key === undefined) {
      return this.store;
    }

    if (typeof key !== 'string') {
      warn(`store.get: key should be string`);
      return null;
    }

    return this._getValue(key);
  }

  set(key: any, value?: any) {
    if (typeof key !== 'string') {
      if (!isObject(key)) {
        warn('store.set: key should be string / object');
        return;
      }

      Object.keys(key).forEach(k => {
        const v = key[k];

        this._setValue(k, v);
      });
    }

    this._setValue(key, value);
  }

  on(key: string, callback: (value: any) => void, force?: boolean) {
    if (typeof key !== 'string') {
      warn('store.on: key should be string');
      return;
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

  off(key: string, callback?: (value: any) => void) {
    if (typeof key !== 'string') {
      warn('store.off: key should be string');
      return;
    }

    if (!isArray(this.storeEmitter[key])) {
      warn(`store.off: ${key} has no callback`);
    }

    if (callback === undefined) {
      this.storeEmitter[key] = undefined;
      return;
    }

    this.storeEmitter[key] = this.storeEmitter[key].filter(cb => cb !== callback);
  }

  has(key: string) {
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
