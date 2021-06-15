/* eslint import/no-mutable-exports: 'off' */

import { isArray, warn } from './utils';
import { setCache, getCache } from './cache';

const eventNameSpace = 'event';

type StringSymbolUnion = string | symbol;

interface Hooks {
  emit(key: StringSymbolUnion, value: any): void;
  on(key: StringSymbolUnion, callback: (value: any) => void): void;
  off(key: StringSymbolUnion, callback?: (value: any) => void): void;
  has(key: StringSymbolUnion): boolean;
}

class Event implements Hooks {
  eventEmitter: object;

  constructor() {
    this.eventEmitter = {};
  }

  emit(key: StringSymbolUnion, ...args) {
    const keyEmitter = this.eventEmitter[key];

    if (!isArray(keyEmitter) || (isArray(keyEmitter) && keyEmitter.length === 0)) {
      warn(`event.emit: no callback is called for ${String(key)}`);
      return;
    }

    keyEmitter.forEach(cb => {
      cb(...args);
    });
  }

  on(key: StringSymbolUnion, callback: (value: any) => void) {
    if (typeof key !== 'string' && typeof key !== 'symbol') {
      warn('event.on: key should be string / symbol');
      return;
    }
    if (callback === undefined || typeof callback !== 'function') {
      warn('event.on: callback is required, should be function');
      return;
    }

    if (!this.eventEmitter[key]) {
      this.eventEmitter[key] = [];
    }

    this.eventEmitter[key].push(callback);
  }

  off(key: StringSymbolUnion, callback?: (value: any) => void) {
    if (typeof key !== 'string' && typeof key !== 'symbol') {
      warn('event.off: key should be string / symbol');
      return;

    }

    if (!isArray(this.eventEmitter[key])) {
      warn(`event.off: ${String(key)} has no callback`);
      return;
    }

    if (callback === undefined) {
      this.eventEmitter[key] = undefined;
      return;
    }

    this.eventEmitter[key] = this.eventEmitter[key].filter(cb => cb !== callback);
  }

  has(key: StringSymbolUnion) {
    const keyEmitter = this.eventEmitter[key];
    return isArray(keyEmitter) && keyEmitter.length > 0;
  }
}

let event = getCache(eventNameSpace);
if (!event) {
  event = new Event();
  setCache(eventNameSpace, event);
}

export default event;
