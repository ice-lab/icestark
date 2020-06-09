import Sandbox from '../src/index';

describe('sandbox: excapeSandbox', () => {
  const sandbox = new Sandbox({});
  const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

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

describe('sandbox: access contructor', () => {
  const sandbox = new Sandbox();

  test('execute global functions', () => {
    sandbox.execScriptInSandbox('window.error = new Error("errmsg");Error.toString();');
    const globalWindow = sandbox.getSandbox();
    expect((globalWindow as any).error.toString()).toBe('Error: errmsg');
  });
});