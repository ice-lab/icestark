
export interface SandboxProps {
  escapeSandbox?: boolean;
}

export interface SandboxContructor {
  new(): Sandbox;
}
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

// get function from original window, such as scrollTo, parseInt
function isWindowFunction(func) {
  return func && typeof func === 'function' && !isConstructor(func);
}

export default class Sandbox {
  private sandbox: Window;

  private escapeSandbox: boolean = false;

  private eventListeners = {};

  private timeoutIds: number[] = [];

  private intervalIds: number[] = [];

  private propertyAdded = {};

  private originalValues = {};

  public sandboxDisabled: boolean;

  constructor({ escapeSandbox }: SandboxProps) {
    if (!window.Proxy) {
      console.warn('proxy sandbox is not support by current browser');
      this.sandboxDisabled = true;
    }
    this.escapeSandbox = escapeSandbox;
    this.sandbox = null;
  }

  createProxySandbox() {
    const { propertyAdded, originalValues, escapeSandbox } = this;
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
        // eslint-disable-next-line no-prototype-builtins
        if (!originalWindow.hasOwnProperty(p)) {
          // recorde value added in sandbox
          propertyAdded[p] = value;
        // eslint-disable-next-line no-prototype-builtins
        } else if (!originalValues.hasOwnProperty(p)) {
          // if it is already been setted in orignal window, record it's original value
          originalValues[p] = originalWindow[p];
        }
        // set new value to original window in case of jsonp, js bundle which will be execute outof sandbox
        if (escapeSandbox) {
          originalWindow[p] = value;
        }
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
        const targetValue = target[p];
        if (targetValue) {
          // case of addEventListener, removeEventListener, setTimeout, setInterval setted in sandbox
          return targetValue;
        } else {
          const value = originalWindow[p];
          if (isWindowFunction(value)) {
            // fix Illegal invocation
            return value.bind(originalWindow);
          } else {
            // case of window.clientWidth、new window.Object()
            return value;
          }
        }
      },
      has(target: Window, p: PropertyKey): boolean {
        return p in target || p in originalWindow;
      },
    });
    this.sandbox = sandbox;
  }

  getSandbox() {
    return this.sandbox;
  }

  execScriptInSandbox(script: string): void {
    if (!this.sandboxDisabled) {
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
  }

  clear() {
    if (!this.sandboxDisabled) { 
      // remove event listeners 
      Object.keys(this.eventListeners).forEach((eventName) => {
        (this.eventListeners[eventName] || []).forEach(listener => {
          window.removeEventListener(eventName, listener);
        });
      });
      // clear timeout
      this.timeoutIds.forEach(id => window.clearTimeout(id));
      this.intervalIds.forEach(id => window.clearInterval(id));
      // recover original values
      Object.keys(this.originalValues).forEach(key => {
        window[key] = this.originalValues[key];
      });
      Object.keys(this.propertyAdded).forEach(key => {
        delete window[key];
      });
    }
  }
}