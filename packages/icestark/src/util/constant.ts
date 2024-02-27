export const PREFIX = 'icestark';

export const DYNAMIC = 'dynamic';

export const STATIC = 'static';

export const ICESTSRK_NOT_FOUND = `/${PREFIX}_404`;

export const ICESTSRK_ERROR = `/${PREFIX}_error`;

export const IS_CSS_REGEX = /\.css(\?((?!\.js$).)+)?$/;

// app status

export const NOT_LOADED = 'NOT_LOADED';

export const LOADING_ASSETS = 'LOADING_ASSETS';

export const LOAD_ERROR = 'LOAD_ERROR';

export const NOT_MOUNTED = 'NOT_MOUNTED';

export const MOUNTED = 'MOUNTED';

export const UNMOUNTED = 'UNMOUNTED';

export enum AppLifeCycleEnum {
  AppEnter = 'appEnter',
  AppLeave = 'appLeave',
}
