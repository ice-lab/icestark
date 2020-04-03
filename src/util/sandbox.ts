// check window contructor function， like Object Array
function isConstructor(fn) {
  const functionStr = fn.toString();
  const upperCaseRegex = /^function\s+[A-Z]/;

  return (
    // generator function and has own prototype properties
    (fn.prototype && fn.prototype.constructor === fn && Object.getOwnPropertyNames(fn.prototype).length > 1) ||
    // upper case
    upperCaseRegex.test(functionStr) ||
    // ES6 class, window function do not have this case
    functionStr.slice(0, 5) === 'class'
  );
}

export default class Sandbox {
  private sandbox: Window;

  private eventListeners = {};

  private timeoutIds: number[] = [];

  private intervalIds: number[] = [];

  constructor() {
    this.sandbox = null;
  }

  createProxySandbox() {
    const proxyWindow = Object.create(null) as Window;
    const originalWindow = window;
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    const originalSetInerval = window.setInterval;
    const originalSetTimeout = window.setTimeout;
    // hijack addEventListener
    proxyWindow.addEventListener = (eventName, fn, ...rest) => {
      const listeners = this.eventListeners[eventName] || [];
      listeners.push(fn);
      return originalAddEventListener.apply(originalWindow, [eventName, fn, ...rest]);
    };
    // hijack removeEventListener
    proxyWindow.removeEventListener = (eventName, fn, ...rest) => {
      const listeners = this.eventListeners[eventName] || [];
      if (listeners.includes(fn)) {
        listeners.splice(listeners.indexOf(fn), 1);
      }
      return originalRemoveEventListener.apply(originalWindow, [eventName, fn, ...rest]);
    };
    // hijack setTimeout
    proxyWindow.setTimeout = (...args) => {
      const timerId = originalSetTimeout(...args);
      this.timeoutIds.push(timerId);
      return timerId;
    };
    // hijack setInterval
    proxyWindow.setInterval = (...args) => {
      const intervalId = originalSetInerval(...args);
      this.intervalIds.push(intervalId);
      return intervalId;
    };

    const sandbox = new Proxy(proxyWindow, {
      set(target: Window, p: PropertyKey, value: any): boolean {
        // eslint-disable-next-line no-param-reassign
        target[p] = value;
        return true;
      },
      get(target: Window, p: PropertyKey): any {
        if (p === Symbol.unscopables) {
          return undefined;
        }
        if (['top', 'window', 'self', 'globalThis'].includes(p as string)) {
          return sandbox;
        }
        const value = target[p] || originalWindow[p];
        if (value && typeof value === 'function' && !target[p] && !isConstructor(value)) {
          // fix Illegal invocation
          return value.bind(originalWindow);
        }
        return value;
      },
      has(target: Window, p: PropertyKey): boolean {
        return p in target || p in originalWindow;
      },
    });
    this.sandbox = sandbox;
  }

  execScriptInSandbox(script: string): void {
    // create sandbox before exec script
    if (!this.sandbox) {
      this.createProxySandbox();
    }
    try {
      const execScript = `with (sandbox) {;${script}\n}`;
      // eslint-disable-next-line no-new-func
      const code = new Function('sandbox', execScript);
      // run code with sandbox
      code(this.sandbox);
    } catch (error) {
      console.error(`error occurs when execute script in sandbox: ${error}`);
      throw error;
    }
  }

  clear() {
    // remove event listeners 
    Object.keys(this.eventListeners).forEach((eventName) => {
      (this.eventListeners[eventName] || []).forEach(listener => {
        window.removeEventListener(eventName, listener);
      });
    });
    // clear timeout
    this.timeoutIds.forEach(id => window.clearTimeout(id));
    this.intervalIds.forEach(id => window.clearInterval(id));
  }
}