import type { AppConfig } from '../apps';
import type { Prefetch } from './prefetch';

export type Fetch = typeof window.fetch | ((url: string) => Promise<Response>);

export type RouteType = 'pushState' | 'replaceState';

export interface StartConfiguration {
  shouldAssetsRemove?: (
    assetUrl?: string,
    element?: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement,
  ) => boolean;
  onRouteChange?: (
    url: string,
    pathname: string,
    query: object,
    hash?: string,
    type?: RouteType | 'init' | 'popstate' | 'hashchange',
  ) => void;
  onAppEnter?: (appConfig: AppConfig) => void;
  onAppLeave?: (appConfig: AppConfig) => void;
  onLoadingApp?: (appConfig: AppConfig) => void;
  onFinishLoading?: (appConfig: AppConfig) => void;
  onError?: (err: Error) => void;
  onActiveApps?: (appConfigs: AppConfig[]) => void;
  reroute?: (url: string, type: RouteType | 'init' | 'popstate'| 'hashchange') => void;
  fetch?: Fetch;
  prefetch?: Prefetch;
  basename?: string;
}

const globalConfiguration: StartConfiguration = {
  shouldAssetsRemove: () => true,
  onRouteChange: () => {},
  onAppEnter: () => {},
  onAppLeave: () => {},
  onLoadingApp: () => {},
  onFinishLoading: () => {},
  onError: () => {},
  onActiveApps: () => {},
  reroute: () => {},
  fetch: window.fetch,
  prefetch: false,
  basename: '',
};

export default globalConfiguration;
