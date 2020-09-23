import { registerMicroApps } from '../src';
import start, { unload } from '../src/start';
import { AppConfig, getMicroApps, mountMicroApp, removeMicroApp, unmountMicroApp, createMicroApp } from '../src/apps';
import { LOADING_ASSETS, MOUNTED, NOT_LOADED, UNMOUNTED } from '../src/util/constant';

describe('app start', () => {
  test('start hijack', () => {
    const routerChange = jest.fn();
    start({
      onRouteChange: routerChange
    });
    // first call when init
    expect(routerChange.mock.calls.length).toBe(1);
    window.history.pushState({}, 'test', '/props-render');
    expect(routerChange.mock.calls.length).toBe(2);
    unload();
  });

  test('active micro app', () => {
    window.history.pushState({}, 'test', '/');
    registerMicroApps([
      {
        name: 'app1',
        activePath: '/test',
        url: ['//icestark.com/index.js']
      },
      {
        name: 'app2',
        activePath: '/test2',
        hashType: true,
        url: ['//icestark.com/index.js']
      },
      {
        name: 'app3',
        activePath: '/',
        exact: true,
        url: ['//icestark.com/index.js']
      },
      {
        name: 'app4',
        activePath: (url) => {
          return url.indexOf('/test4') > -1
        },
        url: ['//icestark.com/index.js']
      },
      {
        name: 'app5',
        activePath: ['/test5', '/test'],
        url: ['//icestark.com/index.js'],
      },
      {
        name: 'app6',
        activePath: [{ path: '/test6', exact: true}],
        url: ['//icestark.com/index.js'],
      }
    ]);
    let activeApps = [];
    start({
      onActiveApps: (apps => {
        activeApps = apps;
      }),
    });
    expect(getMicroApps().length).toBe(6);
    expect(getMicroApps().find(item => item.name === 'app3').status).toBe(LOADING_ASSETS);
    expect(getMicroApps().find(item => item.name === 'app1').status).toBe(NOT_LOADED);
    window.history.pushState({}, 'test', '/test');
    expect(getMicroApps().find(item => item.name === 'app1').status).toBe(LOADING_ASSETS);
    expect(getMicroApps().find(item => item.name === 'app5').status).toBe(LOADING_ASSETS);
    window.history.pushState({}, 'test', '/#/test2');
    expect(getMicroApps().find(item => item.name === 'app2').status).toBe(LOADING_ASSETS);
    window.history.pushState({}, 'test', '/test4');
    expect(getMicroApps().find(item => item.name === 'app4').status).toBe(LOADING_ASSETS);
    window.history.pushState({}, 'test', '/test6/a');
    expect(getMicroApps().find(item => item.name === 'app6').status).toBe(NOT_LOADED);
    expect(activeApps).toStrictEqual([]);
    unload();
  });

  test('remove micro app', () => {
    registerMicroApps([
      {
        name: 'app1',
        activePath: '/test',
        url: ['//icestark.com/index.js']
      },
    ]);
    expect(getMicroApps().length).toBe(1);
    removeMicroApp('app2');
    expect(getMicroApps().length).toBe(1);
    removeMicroApp('app1');
    expect(getMicroApps().length).toBe(0);
  });

  test('mount app', async () => {
    let status = '';
    registerMicroApps([
      {
        name: 'app',
        activePath: '/testapp',
        url: ['//icestark.com/index.js'],
        mount: () => {
          status = MOUNTED;
        },
        unmount: () => {
          status = UNMOUNTED;
        },
      } as AppConfig,
    ]);
    window.history.pushState({}, 'test', '/testapp');
    await mountMicroApp('app');
    expect(status).toBe(MOUNTED);
    await unmountMicroApp('app');
    expect(status).toBe(UNMOUNTED);
    await createMicroApp('app');
    expect(status).toBe(MOUNTED);

    const errorApp = await createMicroApp('app-error');
    expect(errorApp).toBe(null);
  })
});