import { isArray, warn } from './utils';
import { setCache, getCache } from './cache';

const eventNameSpace = 'event';

interface Hooks {
  emit(key: string, value: any): void;
  on(key: string, callback: (value: any) => void): void;
  off(key: string, callback?: (value: any) => void): void;
  has(key: string): boolean;
}

class Event implements Hooks {
  eventEmitter: object;

  constructor() {
    this.eventEmitter = {};
  }

  emit(key: string, ...args) {
    const keyEmitter = this.eventEmitter[key];

    if (!isArray(keyEmitter) || (isArray(keyEmitter) && keyEmitter.length === 0)) {
      warn(`event.emit: no callback is called for ${key}`);
      return;
    }

    keyEmitter.forEach(cb => {
      cb(...args);
    });
  }

  on(key: string, callback: (value: any) => void) {
    if (typeof key !== 'string') {
      warn('event.on: key should be string');
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

  off(key: string, callback?: (value: any) => void) {
    if (typeof key !== 'string') {
      warn('event.off: key should be string');
      return;
    }

    if (!isArray(this.eventEmitter[key])) {
      warn(`event.off: ${key} has no callback`);
    }

    if (callback === undefined) {
      this.eventEmitter[key] = undefined;
      return;
    }

    this.eventEmitter[key] = this.eventEmitter[key].filter(cb => cb !== callback);
  }

  has(key: string) {
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
