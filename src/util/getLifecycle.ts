import { ModuleLifeCycle } from '../apps';
import { getCache, setCache } from './cache';
import { AppLifeCycleEnum } from './appLifeCycle';

export function getLifecyleByLibrary () {
  const libraryName = getCache('library');
  const moduleInfo = window[libraryName] as ModuleLifeCycle;

  if (moduleInfo && moduleInfo.mount && moduleInfo.unmount) {
    const lifecycle = moduleInfo;

    delete window[libraryName];
    setCache('library', null);

    return lifecycle;
  }
  return null;
}

export function getLifecyleByRegister () {
  const mount = getCache(AppLifeCycleEnum.AppEnter);
  const unmount = getCache(AppLifeCycleEnum.AppLeave);

  if (mount && unmount) {
    const lifecycle = {
      mount,
      unmount,
    };

    setCache(AppLifeCycleEnum.AppEnter, null);
    setCache(AppLifeCycleEnum.AppLeave, null);

    return lifecycle;
  }
  return null;
}
