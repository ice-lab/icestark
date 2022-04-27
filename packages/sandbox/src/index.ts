export interface SandboxProps {
  multiMode?: boolean;
}

export interface SandboxConstructor {
  new(): Sandbox;
}

// check window constructor function， like Object Array
function isConstructor(fn) {
  // generator function and has own prototype properties
  const hasConstructor = fn.prototype && fn.prototype.constructor === fn && Object.getOwnPropertyNames(fn.prototype).length > 1;
  // unnecessary to call toString if it has constructor function
  const functionStr = !hasConstructor && fn.toString();
  const upperCaseRegex = /^function\s+[A-Z]/;

  return (
    hasConstructor ||
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

  private multiMode = false;

  private eventListeners = {};

  private timeoutIds: number[] = [];

  private intervalIds: number[] = [];

  private propertyAdded = {};

  private propertyModified = {};

  private originalValues = {};

  public sandboxDisabled: boolean;

  constructor(props: SandboxProps = {}) {
    const { multiMode } = props;
    if (!window.Proxy) {
      console.warn('proxy sandbox is not support by current browser');
      this.sandboxDisabled = true;
    }
    // enable multiMode in case of create mulit sandbox in same time
    this.multiMode = multiMode;
    this.sandbox = null;
  }

  createProxySandbox(injection?: object) {
    const { propertyAdded, propertyModified, originalValues, multiMode } = this;
    const proxyWindow = Object.create(null) as Window;
    const originalWindow = window;
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    const originalSetInterval = window.setInterval;
    const originalSetTimeout = window.setTimeout;

    // hijack addEventListener
    proxyWindow.addEventListener = (eventName, fn, ...rest) => {
      this.eventListeners[eventName] = (this.eventListeners[eventName] || []);
      this.eventListeners[eventName].push(fn);

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
      const intervalId = originalSetInterval(...args);
      this.intervalIds.push(intervalId);
      return intervalId;
    };

    const sandbox = new Proxy(proxyWindow, {
      set(target: Window, p: PropertyKey, value: any): boolean {
        // eslint-disable-next-line no-prototype-builtins
        if (!originalWindow.hasOwnProperty(p)) {
          // record value added in sandbox
          propertyAdded[p] = value;
        // eslint-disable-next-line no-prototype-builtins
        } else if (!originalValues.hasOwnProperty(p)) {
          // if it is already been setted in original window, record it's original value
          originalValues[p] = originalWindow[p];
          propertyModified[p] = value;
        }
        // set new value to original window in case of jsonp, js bundle which will be execute outof sandbox
        if (!multiMode) {
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
        // proxy hasOwnProperty, in case of proxy.hasOwnProperty value represented as originalWindow.hasOwnProperty
        if (p === 'hasOwnProperty') {
          // eslint-disable-next-line no-prototype-builtins
          return (key: PropertyKey) => !!target[key] || originalWindow.hasOwnProperty(key);
        }

        const targetValue = target[p];
        /**
         * Falsy value like 0/ ''/ false should be trapped by proxy window.
         */
        if (targetValue !== undefined) {
          // case of addEventListener, removeEventListener, setTimeout, setInterval setted in sandbox
          return targetValue;
        }

        // search from injection
        const injectionValue = injection && injection[p];
        if (injectionValue) {
          return injectionValue;
        }

        const value = originalWindow[p];

        /**
        * use `eval` indirectly if you bind it. And if eval code is not being evaluated by a direct call,
        * then initialise the execution context as if it was a global execution context.
        * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
        * https://262.ecma-international.org/5.1/#sec-10.4.2
        */
        if (p === 'eval') {
          return value;
        }

        if (isWindowFunction(value)) {
          // When run into some window's functions, such as `console.table`,
          // an illegal invocation exception is thrown.
          const boundValue = value.bind(originalWindow);

          // Axios, Moment, and other callable functions may have additional properties.
          // Simply copy them into boundValue.
          for (const key in value) {
            boundValue[key] = value[key];
          }

          return boundValue;
        } else {
          // case of window.clientWidth、new window.Object()
          return value;
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

  getAddedProperties() {
    return this.propertyAdded;
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
        const code = new Function('sandbox', execScript).bind(this.sandbox);
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
        (this.eventListeners[eventName] || []).forEach((listener) => {
          window.removeEventListener(eventName, listener);
        });
      });
      // clear timeout
      this.timeoutIds.forEach((id) => window.clearTimeout(id));
      this.intervalIds.forEach((id) => window.clearInterval(id));
      // recover original values
      Object.keys(this.originalValues).forEach((key) => {
        window[key] = this.originalValues[key];
      });
      Object.keys(this.propertyAdded).forEach((key) => {
        delete window[key];
      });
    }
  }
}
