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
  /**
   * Whether to freeze the runtime library to prevent accidental modifications.
   * When set to true, the versioned runtime library (e.g., window['React@17.0.0'])
   * will not be modifiable after its initial assignment.
   */
  freezeRuntime?: boolean;
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
  freezeRuntime: false,
};

export default globalConfiguration;

// todos: remove it from 3.x
export const temporaryState = {
  shouldAssetsRemoveConfigured: false,
};
