import '@testing-library/jest-dom/extend-expect';
import Sandbox from '../src/index';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('sandbox: excapeSandbox', () => {
  const sandbox = new Sandbox({});
  const delay = (time) => new Promise<void>((resolve) => setTimeout(() => resolve(), time));

  test('execute script in sandbox', () => {
    sandbox.execScriptInSandbox('window.a = 1;expect(window.a).toBe(1);');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).a).toBe(1);
    sandbox.clear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).a).toBe(undefined);
  });

  test('capture global event', async () => {
    sandbox.execScriptInSandbox(`
      setInterval(() => {expect(1).toBe(2)}, 100);
      setTimeout(() => { expect(1).toBe(2)}, 100)`
    );
    sandbox.clear();
    // delay 1000 ms for timeout
    await delay(1000);
    expect(true).toBe(true);
  });
});

describe('sandbox: default props', () => {
  const sandbox = new Sandbox({ multiMode: true });

  test('execute script in sandbox', () => {
    sandbox.execScriptInSandbox('window.a = 1;expect(window.a).toBe(1);');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).a).toBe(undefined);
  });
});

describe('sandbox: access constructor', () => {
  const sandbox = new Sandbox();

  test('execute global functions', () => {
    sandbox.execScriptInSandbox('window.error = new Error("errmsg");Error.toString();');
    const globalWindow = sandbox.getSandbox();
    expect((globalWindow as any).error.toString()).toBe('Error: errmsg');
  });
});

describe('sanbox: binding this', () => {
  const sandbox = new Sandbox();
  test('bind this to proxy', () => {
    sandbox.execScriptInSandbox('expect(window === this).toBe(true);');
  });
});

describe('sandbox: falsy values should be trapped.', () => {
  const sandbox = new Sandbox({ multiMode: true });

  test('Falsy value - 0', () => {
    sandbox.execScriptInSandbox('window.a = 0;expect(window.a).toBe(0);');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).a).toBe(undefined);
  });

  test('Falsy value - false', () => {
    sandbox.execScriptInSandbox('window.b = false;expect(window.b).toBe(false);');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).a).toBe(undefined);
  });

  test('Falsy value - void 0', () => {
    sandbox.execScriptInSandbox('window.c = void 0;expect(window.c).toBe(undefined);');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).a).toBe(undefined);
  });
});

describe('sandbox: eventListener and setTimeout should be trapped', () => {
  /**
   * for some reason, set `setTimeout: false` to enable communicate with global.
   */
  const sandbox = new Sandbox({ multiMode: false });

  test('trap eventListener and setTimeout', async () => {
    sandbox.execScriptInSandbox(`
      window.count = 0;
      window.addEventListener('popstate', (event) => {
        console.warn('sandbox: onPopState count', count);
        count += 1;
      });
      history.pushState({page: 1}, "title 1", "?page=1");
      history.pushState({page: 2}, "title 2", "?page=2");
      history.pushState({page: 3}, "title 3", "?page=3");
      history.back();

      window.id = setTimeout(() => {
        expect(count).toEqual(1);
      }, 100)
    `);

    await delay(1000);
    expect((window as any).count).toEqual(1);
    sandbox.clear();
    history.back();
    await delay(1000);
    expect((window as any).count).toEqual(undefined);
  });
});

describe('eval in sandbox', () => {
  const sandbox = new Sandbox({ multiMode: true });

  test('execution context is not global execution context', () => {
    let error = null;
    try {
      sandbox.execScriptInSandbox(
        `
          function bar (value) {
            eval('console.log(value);');
          }
          bar(1);
        `
      );
    } catch (e) {
      error = e.message;
    }

    expect(error).toBe(null);
  });
});

