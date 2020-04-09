import Sandbox from '../src/index';

describe('sandbox', () => {
  const sandbox = new Sandbox();
  const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

  test('execute script in sandbox', () => {
    sandbox.execScriptInSandbox('window.a = 1;expect(window.a).toBe(1);');
    expect((window as any).a).toBe(1);
    sandbox.clear();
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