import * as React from 'react';
import * as urlParse from 'url-parse';
import { AppConfig, AppRouteProps, AppRouteComponentProps } from './AppRoute';
import appHistory from './appHistory';
import matchPath from './matchPath';
import { recordAssets } from './handleAssets';
import { ICESTSRK_NOT_FOUND } from './constant';
import { setCache } from './cache';

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
  useShadow?: boolean;
  onAppEnter?: (appConfig: AppConfig) => void;
  onAppLeave?: (appConfig: AppConfig) => void;
  shouldAssetsRemove?: (assetUrl?: string) => boolean;
}

interface AppRouterState {
  url: string;
  forceRenderCount: number;
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

  static defaultProps = {
    onRouteChange: () => {},
    ErrorComponent: ({ err }) => <div>{err}</div>,
    NotFoundComponent: <div>NotFound</div>,
    useShadow: false,
    shouldAssetsRemove: () => true,
  };

  constructor(props: AppRouterProps) {
    super(props);
    this.state = {
      url: location.href,
      forceRenderCount: 0,
    };
    recordAssets();
  }

  componentDidMount() {
    this.hijackHistory();
    this.handleRouteChange(location.href, 'init');

    // render NotFoundComponent eventListener
    window.addEventListener('icestark:not-found', this.triggerNotFound);
  }

  componentWillUnmount() {
    this.unHijackHistory();
    window.removeEventListener('icestark:not-found', this.triggerNotFound);
  }

  /**
   * Trigger NotFound
   */
  triggerNotFound = () => {
    this.setState({ url: ICESTSRK_NOT_FOUND });
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
   * Trigger statechange: pushState | replaceState
   */
  handleStateChange = (state: any, url: string, routeType?: RouteType): void => {
    // deal with forceRender
    if (state && (state.forceRender || (state.state && state.state.forceRender))) {
      const { forceRenderCount } = this.state;
      this.setState({ url, forceRenderCount: forceRenderCount + 1 });
    } else {
      this.setState({ url });
    }
    this.handleRouteChange(url, routeType);
  };

  /**
   * Trigger popstate
   */
  handlePopState = (): void => {
    const url = location.href;

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
      useShadow,
      onAppEnter,
      onAppLeave,
      shouldAssetsRemove,
      children,
    } = this.props;
    const { url, forceRenderCount } = this.state;

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

    const extraProps: any = {
      ErrorComponent,
      LoadingComponent,
      useShadow,
      forceRenderCount,
      onAppEnter,
      onAppLeave,
      shouldAssetsRemove,
    };

    if (match) {
      const { path, basename, render, component } = element.props as AppRouteProps;

      const commonProps: AppRouteComponentProps = {
        location: { pathname, query, hash },
        match,
        history: appHistory,
      };

      if (component) {
        return renderComponent(component, commonProps);
      }

      if (render && typeof render === 'function') {
        return render(commonProps);
      }

      // render AppRoute
      setCache('basename', basename || (Array.isArray(path) ? path[0] : path));

      return React.cloneElement(element, extraProps);
    }

    return renderComponent(NotFoundComponent, {});
  }
}
