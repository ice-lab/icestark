import * as React from 'react';
import * as urlParse from 'url-parse';
import { AppConfig, AppRouteProps, AppRouteComponentProps } from './AppRoute';
import appHistory from './appHistory';
import matchPath from './util/matchPath';
import { recordAssets, emptyAssets } from './util/handleAssets';
import { ICESTSRK_NOT_FOUND, ICESTSRK_ERROR } from './util/constant';
import { setCache } from './util/cache';
import { callAppLeave } from './util/appLifeCycle';
import {
  isInPopStateListeners,
  addPopStateListeners,
  removePopStateListeners,
  setHistoryState,
} from './util/capturedListeners';

type RouteType = 'pushState' | 'replaceState';

export interface AppRouterProps {
  onRouteChange?: (
    pathname: string,
    query: object,
    hash?: string,
    type?: RouteType | 'init' | 'popstate',
  ) => void;
  ErrorComponent?: any;
  LoadingComponent?: any;
  NotFoundComponent?: any;
  onAppEnter?: (appConfig: AppConfig) => void;
  onAppLeave?: (appConfig: AppConfig) => void;
  shouldAssetsRemove?: (
    assetUrl?: string,
    element?: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement,
  ) => boolean;
}

interface AppRouterState {
  url: string;
  showLoading: boolean;
}

interface OriginalStateFunction {
  (state: any, title: string, url?: string): void;
}

function addLeadingSlash(path: string): string {
  return path.charAt(0) === '/' ? path : `/${path}`;
}

const HashPathDecoders = {
  hashbang: path => (path.charAt(0) === '!' ? path.substr(1) : path),
  noslash: addLeadingSlash,
  slash: addLeadingSlash,
};

function getHashPath(hash: string = '/'): string {
  const hashIndex = hash.indexOf('#');
  const hashPath = hashIndex === -1 ? hash : hash.substr(hashIndex + 1);

  // remove hash query
  const searchIndex = hashPath.indexOf('?');
  return searchIndex === -1 ? hashPath : hashPath.substr(0, searchIndex);
}

/**
 * Render Component, compatible with Component and <Component>
 */
function renderComponent(Component: any, props = {}): React.ReactElement {
  return React.isValidElement(Component) ? (
    React.cloneElement(Component, props)
  ) : (
    <Component {...props} />
  );
}

export default class AppRouter extends React.Component<AppRouterProps, AppRouterState> {
  private originalPush: OriginalStateFunction = window.history.pushState;

  private originalReplace: OriginalStateFunction = window.history.replaceState;

  private originalAddEventListener = window.addEventListener;

  private originalRemoveEventListener = window.removeEventListener;

  private unmounted: boolean = false;

  private err: string = ''; // js assets load err

  static defaultProps = {
    onRouteChange: () => {},
    ErrorComponent: ({ err }) => <div>{err}</div>,
    NotFoundComponent: <div>NotFound</div>,
    shouldAssetsRemove: () => true,
  };

  constructor(props: AppRouterProps) {
    super(props);
    this.state = {
      url: location.href,
      showLoading: false,
    };
    recordAssets();
  }

  componentDidMount() {
    this.hijackHistory();
    this.hijackEventListener();
    this.handleRouteChange(location.href, 'init');

    // render NotFoundComponent eventListener
    window.addEventListener('icestark:not-found', this.triggerNotFound);
  }

  componentWillUnmount() {
    const { shouldAssetsRemove } = this.props;

    this.unHijackHistory();
    this.unHijackEventListener();
    emptyAssets(shouldAssetsRemove);
    window.removeEventListener('icestark:not-found', this.triggerNotFound);
    this.unmounted = true;
  }

  /**
   * Trigger NotFound
   */
  triggerNotFound = (): void => {
    callAppLeave();

    // if AppRouter is unmounted, cancel all operations
    if (this.unmounted) return;

    this.setState({ url: ICESTSRK_NOT_FOUND });
  };

  /**
   * Trigger Loading
   */
  triggerLoading = (newShowLoading: boolean): void => {
    // if AppRouter is unmounted, cancel all operations
    if (this.unmounted) return;
    // if no LoadingComponent, showLoading will never be true
    if (newShowLoading && !this.props.LoadingComponent) return;

    const { showLoading } = this.state;
    if (showLoading !== newShowLoading) {
      this.setState({ showLoading: newShowLoading });
    }
  };

  /**
   * Trigger Error
   */
  triggerError = (err: string): void => {
    callAppLeave();

    // if AppRouter is unmounted, cancel all operations
    if (this.unmounted) return;

    this.err = err;
    this.setState({ url: ICESTSRK_ERROR });
  };

  /**
   * Hijack window.history
   */
  hijackHistory = (): void => {
    window.history.pushState = (state: any, title: string, url?: string, ...rest) => {
      this.originalPush.apply(window.history, [state, title, url, ...rest]);
      this.handleStateChange(state, url, 'pushState');
    };

    window.history.replaceState = (state: any, title: string, url?: string, ...rest) => {
      this.originalReplace.apply(window.history, [state, title, url, ...rest]);
      this.handleStateChange(state, url, 'replaceState');
    };

    window.addEventListener('popstate', this.handlePopState, false);
  };

  /**
   * Unhijack window.history
   */
  unHijackHistory = (): void => {
    window.history.pushState = this.originalPush;
    window.history.replaceState = this.originalReplace;

    window.removeEventListener('popstate', this.handlePopState, false);
  };

  /**
   * Hijack eventListener
   */
  hijackEventListener = (): void => {
    window.addEventListener = (eventName, fn, ...rest) => {
      if (typeof fn === 'function' && eventName === 'popstate' && !isInPopStateListeners(fn)) {
        addPopStateListeners(fn);
        return;
      }

      return this.originalAddEventListener.apply(window, [eventName, fn, ...rest]);
    };

    window.removeEventListener = (eventName, listenerFn, ...rest) => {
      if (typeof listenerFn === 'function' && eventName === 'popstate') {
        removePopStateListeners(listenerFn);
        return;
      }

      return this.originalRemoveEventListener.apply(window, [eventName, listenerFn, ...rest]);
    };
  };

  /**
   * Unhijack eventListener
   */
  unHijackEventListener = (): void => {
    window.addEventListener = this.originalAddEventListener;
    window.removeEventListener = this.originalRemoveEventListener;
  };

  /**
   * Trigger statechange: pushState | replaceState
   */
  handleStateChange = (state: any, url: string, routeType?: RouteType): void => {
    this.setState({ url });

    setHistoryState(state);

    this.handleRouteChange(url, routeType);
  };

  /**
   * Trigger popstate
   */
  handlePopState = (state): void => {
    const url = location.href;

    setHistoryState(state);

    this.setState({ url });
    this.handleRouteChange(url, 'popstate');
  };

  /**
   * Trigger onRouteChange
   */
  handleRouteChange = (url: string, type: RouteType | 'init' | 'popstate'): void => {
    const { pathname, query, hash } = urlParse(url, true);
    this.props.onRouteChange(pathname, query, hash, type);
  };

  render() {
    const {
      NotFoundComponent,
      ErrorComponent,
      LoadingComponent,
      onAppEnter,
      onAppLeave,
      shouldAssetsRemove,
      children,
    } = this.props;
    const { url, showLoading } = this.state;

    // directly render NotFoundComponent / ErrorComponent
    if (url === ICESTSRK_NOT_FOUND) {
      return renderComponent(NotFoundComponent, {});
    } else if (url === ICESTSRK_ERROR) {
      return renderComponent(ErrorComponent, { err: this.err });
    }

    const { pathname, query, hash } = urlParse(url, true);

    let match: any = null;
    let element: any;

    React.Children.forEach(children, child => {
      if (match == null && React.isValidElement(child)) {
        element = child;

        const { path, hashType } = child.props as AppRouteProps;

        if (hashType) {
          const decodePath = HashPathDecoders[hashType === true ? 'slash' : hashType];
          const hashPath = decodePath(getHashPath(hash));

          match = path ? matchPath(hashPath, { ...child.props }) : null;
        } else {
          match = path ? matchPath(pathname, { ...child.props }) : null;
        }
      }
    });

    if (match) {
      const { path, basename, render, component } = element.props as AppRouteProps;

      const commonProps: AppRouteComponentProps = {
        location: { pathname, query, hash },
        match,
        history: appHistory,
      };

      if (component) {
        callAppLeave();
        return renderComponent(component, commonProps);
      }

      if (render && typeof render === 'function') {
        callAppLeave();
        return render(commonProps);
      }

      // render AppRoute
      setCache('basename', basename || (Array.isArray(path) ? path[0] : path));

      const extraProps: any = {
        onAppEnter,
        onAppLeave,
        triggerLoading: this.triggerLoading,
        triggerError: this.triggerError,
        shouldAssetsRemove,
      };

      return (
        <div>
          {showLoading ? renderComponent(LoadingComponent, {}) : null}
          {React.cloneElement(element, extraProps)}
        </div>
      );
    }

    return renderComponent(NotFoundComponent, {});
  }
}
