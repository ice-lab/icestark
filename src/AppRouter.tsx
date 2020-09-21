import * as React from 'react';
import * as urlParse from 'url-parse';
import { AppRouteProps, AppRouteComponentProps } from './AppRoute';
import appHistory from './appHistory';
import renderComponent from './util/renderComponent';
import { ICESTSRK_ERROR } from './util/constant';
import { setCache } from './util/cache';
import start, { unload } from './start';
import { matchActivePath } from './util/matchPath';
import { AppConfig } from './apps';

type RouteType = 'pushState' | 'replaceState';

export interface PathData {
  value: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

export interface AppRouterProps {
  onRouteChange?: (
    pathname: string,
    query: object,
    hash?: string,
    type?: RouteType | 'init' | 'popstate',
  ) => void;
  ErrorComponent?: React.ComponentType;
  LoadingComponent?: React.ComponentType;
  NotFoundComponent?: React.ComponentType;
  onAppEnter?: (appConfig: AppConfig) => void;
  onAppLeave?: (appConfig: AppConfig) => void;
  shouldAssetsRemove?: (
    assetUrl?: string,
    element?: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement,
  ) => boolean;
  basename?: string;
}

interface AppRouterState {
  url: string;
  appLoading: string;
}

export function converArray2String(list: string | (string | PathData)[]) {
  if (Array.isArray(list)) {
    return list.map((item) => {
      if (Object.prototype.toString.call(item) === '[object Object]') {
        return Object.keys(item).map((key) => `${key}:${item[key]}`).join(',');
      }
      return item;
    }).join(',');
  }
  return String(list);
}

export default class AppRouter extends React.Component<AppRouterProps, AppRouterState> {

  private unmounted: boolean = false;

  private err: string = ''; // js assets load err

  private appKey: string = '';

  static defaultProps = {
    onRouteChange: () => {},
    // eslint-disable-next-line react/jsx-filename-extension
    ErrorComponent: ({ err }) => <div>{err}</div>,
    NotFoundComponent: <div>NotFound</div>,
    shouldAssetsRemove: () => true,
    onAppEnter: () => {},
    onAppLeave: () => {},
    basename: '',
  };

  constructor(props: AppRouterProps) {
    super(props);
    this.state = {
      url: location.href,
      appLoading: '',
    };
    const { shouldAssetsRemove, onAppEnter, onAppLeave } = props;
    start({
      shouldAssetsRemove,
      onRouteChange: this.handleRouteChange,
      onAppLeave,
      onAppEnter,
      onLoadingApp: this.loadingApp,
      onFinishLoading: this.finishLoading,
      onError: this.triggerError,
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
    unload();
  }

  /**
   * Trigger Error
   */
  triggerError = (err): void => {
    // if AppRouter is unmounted, cancel all operations
    if (this.unmounted) return;

    this.err = err;
    this.setState({ url: ICESTSRK_ERROR });
  };

  /**
   * Trigger onRouteChange
   */
  handleRouteChange = (url: string, pathname, query, hash, type: RouteType | 'init' | 'popstate'): void => {
    this.setState({ url });
    this.props.onRouteChange(pathname, query, hash, type);
  };

  loadingApp = (app) => {
    this.setState({ appLoading: app.name });
  }

  finishLoading = (app) => {
    const { appLoading } = this.state;
    if (appLoading === app.name) {
      this.setState({ appLoading: '' });
    }
  }

  render() {
    const {
      NotFoundComponent,
      ErrorComponent,
      LoadingComponent,
      children,
      basename: appBasename ,
    } = this.props;
    const { url, appLoading } = this.state;

    // directly render ErrorComponent
    if (url === ICESTSRK_ERROR) {
      return renderComponent(ErrorComponent, { err: this.err });
    }
    
    let match = null;
    let element: React.ReactElement;
    React.Children.forEach(children, child => {
      if (match == null && React.isValidElement(child)) {
        element = child;
        match = matchActivePath(url, child.props);
      }
    });

    if (match) {
      const { path, basename, name } = element.props as AppRouteProps;
      setCache('basename', `${appBasename}${basename || (Array.isArray(path) ? (path[0] as PathData).value || path[0] : path)}`);
      this.appKey = name || converArray2String(path);
      const componentProps: AppRouteComponentProps = {
        location: urlParse(url, true),
        match,
        history: appHistory,
      };
      return (
        <div>
          {appLoading === this.appKey ? renderComponent(LoadingComponent, {}) : null}
          {React.cloneElement(element, { name: this.appKey, componentProps, cssLoading: appLoading === this.appKey })}
        </div>
      );
    }
    return renderComponent(NotFoundComponent, {});
  }
}
