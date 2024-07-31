import * as React from 'react';
import urlParse from 'url-parse';
import { AppRouteProps, AppRouteComponentProps, CompatibleAppConfig } from './AppRoute';
import appHistory from './appHistory';
import renderComponent from './util/renderComponent';
import { ICESTSRK_ERROR, ICESTSRK_NOT_FOUND } from './util/constant';
import start, { unload } from './start';
import { AppConfig, MicroApp } from './apps';
import { doPrefetch, Prefetch } from './util/prefetch';
import findActivePath, { AppRoutePath, formatPath } from './util/checkActive';
import { converArray2String, isFunction, mergeFrameworkBaseToPath } from './util/helpers';
import type { Fetch } from './util/globalConfiguration';

type RouteType = 'pushState' | 'replaceState';

export interface AppRouterProps {
  onRouteChange?: (
    pathname: string,
    query: object,
    hash?: string,
    type?: RouteType | 'init' | 'popstate',
  ) => void;
  ErrorComponent?: React.ComponentType | React.ReactElement;
  LoadingComponent?: React.ComponentType | React.ReactElement;
  NotFoundComponent?: React.ComponentType | React.ReactElement;
  onAppEnter?: (appConfig: CompatibleAppConfig) => void;
  onAppLeave?: (appConfig: CompatibleAppConfig) => void;
  onLoadingApp?: (appConfig: CompatibleAppConfig) => void;
  onFinishLoading?: (appConfig: CompatibleAppConfig) => void;
  onError?: (err: Error) => void;
  shouldAssetsRemove?: (
    assetUrl?: string,
    element?: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement,
  ) => boolean;
  basename?: string;
  fetch?: Fetch;
  prefetch?: Prefetch;
}

interface AppRouterState {
  url: string;
  appLoading: string;
  started: boolean;
}

export default class AppRouter extends React.Component<React.PropsWithChildren<AppRouterProps>, AppRouterState> {
  static defaultProps = {
    onRouteChange: () => {},
    // eslint-disable-next-line react/jsx-filename-extension
    ErrorComponent: ({ err }: { err: string | Error }) => (
      <div>{typeof err === 'string' ? err : err?.message}</div>
    ),
    LoadingComponent: <div>Loading...</div>,
    NotFoundComponent: <div>NotFound</div>,
    onAppEnter: () => {},
    onAppLeave: () => {},
    onLoadingApp: () => {},
    onFinishLoading: () => {},
    onError: () => {},
    basename: '',
    fetch: window.fetch,
    prefetch: false,
  };

  private unmounted = false;

  private err: string | Error = '';

  private appKey = '';

  constructor(props) {
    super(props);
    this.state = {
      url: '',
      appLoading: '',
      started: false,
    };

    const { fetch, prefetch: strategy, children } = props;

    if (strategy) {
      this.prefetch(strategy, children, fetch);
    }
  }

  componentDidMount() {
    // render NotFoundComponent eventListener
    window.addEventListener('icestark:not-found', this.triggerNotFound);
    window.addEventListener('icestark:error', this.errorEventHandler);

    /** lifecycle `componentWillUnmount` of pre-rendering executes later then
     * `constructor` and `componentWilllMount` of next-rendering, whereas `start` should be invoked before `unload`.
     * status `started` used to make sure parent's `componentDidMount` to be invoked eariler then child's,
     * for mounting child component needs global configuration be settled.
     */
    const { shouldAssetsRemove, onAppLeave, fetch, basename } = this.props;
    start({
      onAppLeave,
      onAppEnter: this.appEnter,
      onLoadingApp: this.loadingApp,
      onFinishLoading: this.finishLoading,
      onError: this.triggerError,
      reroute: this.handleRouteChange,
      fetch,
      basename,
      ...(shouldAssetsRemove ? { shouldAssetsRemove } : {}),
    });

    this.setState({ started: true });
  }

  componentWillUnmount() {
    this.unmounted = true;
    window.removeEventListener('icestark:not-found', this.triggerNotFound);
    window.removeEventListener('icestark:error', this.errorEventHandler);
    unload();
    this.setState({ started: false });
  }

  /**
   * prefetch for resources.
   * no worry to excute `prefetch` many times, for all prefetched resources have been cached, and never request twice.
   */
  prefetch = (strategy: Prefetch, children: React.ReactNode, fetch: Fetch = window.fetch) => {
    const apps: AppConfig[] = React.Children
      /**
       * we can do prefetch for url, entry and entryContent.
       */
      .map(children, (childElement) => {
        if (React.isValidElement(childElement)) {
          const { url, entry, entryContent, name, path } = childElement.props as AppRouteProps;
          if (url || entry || entryContent) {
            return {
              ...childElement.props,
              /**
               * name of AppRoute may be not provided, use `path` instead.
               */
              name: name || converArray2String(path),
            };
          }
        }
        return false;
      })
      .filter(Boolean);

    doPrefetch(apps as MicroApp[], strategy, fetch);
  };

  /**
   * Trigger Error
   */
  triggerError = (err): void => {
    // if AppRouter is unmounted, cancel all operations
    if (this.unmounted) return;

    this.props.onError(err);
    this.err = err;
    this.setState({ url: ICESTSRK_ERROR });
  };

  /**
   * error event handler
   */
  errorEventHandler = (e: CustomEvent): void => {
    this.triggerError(e.detail);
  };

  triggerNotFound = (): void => {
    // if AppRouter is unmounted, cancel all operations
    if (this.unmounted) return;
    this.setState({ url: ICESTSRK_NOT_FOUND });
  };

  /**
   * Trigger onRouteChange
   */
  handleRouteChange = (url: string, type: RouteType | 'init' | 'popstate'): void => {
    // Avoid to set undefined url.
    if (!this.unmounted && url !== this.state.url && url) {
      this.setState({ url });

      const { pathname, query, hash } = urlParse(url, true);
      this.props.onRouteChange(pathname, query, hash, type);
    }
  };

  appEnter = (app: AppConfig) => {
    this.props.onAppEnter(app);
    if (this.props.prefetch) {
      // 预加载场景需要将loading提升，否则会由于脚本阻塞进程，导致loading失效
      this.setState({ appLoading: app.name });
    }
  };

  loadingApp = (app: AppConfig) => {
    if (this.unmounted) return;
    this.props.onLoadingApp(app);
    this.setState({ appLoading: app.name });
  };

  finishLoading = (app: AppConfig) => {
    if (this.unmounted) return;
    this.props.onFinishLoading(app);
    const { appLoading } = this.state;
    if (appLoading === app.name) {
      this.setState({ appLoading: '' });
    }
  };

  render() {
    const {
      NotFoundComponent,
      ErrorComponent,
      LoadingComponent,
      children,
      basename: frameworkBasename,
    } = this.props;
    const { url, appLoading, started } = this.state;

    if (!started) {
      return renderComponent(LoadingComponent, {});
    }

    // directly render ErrorComponent
    if (url === ICESTSRK_NOT_FOUND) {
      return renderComponent(NotFoundComponent, {});
    } else if (url === ICESTSRK_ERROR) {
      return renderComponent(ErrorComponent, { err: this.err });
    }

    let match = false;
    let element: React.ReactElement;

    React.Children.forEach(children, (child) => {
      if (!match && React.isValidElement(child)) {
        const { path, activePath, exact, strict, sensitive, hashType } = child.props;

        const compatPath = mergeFrameworkBaseToPath(
          formatPath(activePath || path, {
            exact,
            strict,
            sensitive,
            hashType,
          }),
          frameworkBasename,
        );

        element = child;

        match = !!findActivePath(compatPath)(url);
      }
    });

    if (match) {
      const { name, activePath, path, location } = element.props as AppRouteProps;

      if (isFunction(activePath) && !name) {
        const err = new Error('[icestark]: name is required in AppConfig');
        console.error(err);
        return renderComponent(ErrorComponent, { err });
      }

      this.appKey = name || converArray2String((activePath || path) as AppRoutePath);
      const componentProps: AppRouteComponentProps = {
        // Get location from props when location change controlled by react state.
        location: location || urlParse(url, true),
        match,
        history: appHistory,
      };
      return (
        <div>
          {appLoading === this.appKey ? renderComponent(LoadingComponent, {}) : null}
          {React.cloneElement(element, {
            key: this.appKey,
            name: this.appKey,
            componentProps,
            cssLoading: appLoading === this.appKey,
            onAppEnter: this.appEnter,
            onAppLeave: this.props.onAppLeave,
          })}
        </div>
      );
    }
    return renderComponent(NotFoundComponent, {});
  }
}
