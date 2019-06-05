import * as React from 'react';
import * as urlParse from 'url-parse';
import AppRoute from './AppRoute';
import { ICESTSRK_NOT_FOUND } from './constant';
import matchPath from './util/matchPath';
import { setIcestark } from './util/index';

type RouteType = 'pushState' | 'replaceState';

export interface AppRouterProps {
  onRouteChange?: (
    pathname: string,
    query: object,
    type: RouteType | 'init' | 'onpopstate',
  ) => void;
  ErrorComponent?: any;
  LoadingComponent?: any;
  NotFoundComponent?: any;
  useShadow?: boolean;
}

interface AppRouterState {
  url: string;
}

export default class AppRouter extends React.Component<AppRouterProps, AppRouterState> {
  static defaultProps = {
    ErrorComponent: <div>js bundle loaded error</div>,
    NotFoundComponent: <div>NotFound</div>,
    useShadow: false,
  };

  state: AppRouterState = {
    url: location.href,
  };

  private forceRender: boolean = false;

  private isBrowserForce: boolean = false;

  private originalPush: (state: any, title: string, url?: string) => void;

  private originalReplace: (state: any, title: string, url?: string) => void;

  componentDidMount() {
    this.hijackHistory();
    this.handleRouteChange(location.href, 'init');
    setIcestark('handleNotFound', this.handleNotFound);
  }

  componentWillUnmount() {
    this.unHijackHistory();
    setIcestark('handleNotFound', null);
  }

  /**
   * Render NotFoundComponent
   */
  handleNotFound = () => {
    // return null for browser or history forward / back
    if (this.isBrowserForce) {
      return null;
    }

    window.history.replaceState(
      {
        forceRender: true,
      },
      null,
      '/404',
    );

    // Compatible processing return renderNotFound();
    return null;
  };

  /**
   * Hijack window.history
   */
  hijackHistory = (): void => {
    this.originalPush = window.history.pushState;
    this.originalReplace = window.history.replaceState;

    // hijack route change
    const onRouteChange = (state: any, url: string, routeType?: RouteType): void => {
      this.isBrowserForce = false;

      // deal with forceRender
      if (state && (state.forceRender || (state.state && state.state.forceRender))) {
        this.forceRender = true;
        this.setState({ url });
      } else if (this.forceRender) {
        this.forceRender = false;
      }

      // trigger onRouteChange
      this.handleRouteChange(url, routeType);
    };

    window.history.pushState = (state: any, title: string, url?: string, ...rest) => {
      onRouteChange(state, url, 'pushState');
      this.originalPush.apply(window.history, [state, title, url, ...rest]);
    };
    window.history.replaceState = (state, title, url, ...rest) => {
      onRouteChange(state, url, 'replaceState');
      this.originalReplace.apply(window.history, [state, title, url, ...rest]);
    };

    // handle browser or history forward / back
    window.onpopstate = () => {
      this.isBrowserForce = true;
      this.forceRender = true;

      const url = location.href;
      this.setState({ url });
      // trigger onRouteChange
      this.handleRouteChange(url, 'onpopstate');
    };
  };

  /**
   * Unhijacking history
   */
  unHijackHistory = (): void => {
    window.history.pushState = this.originalPush;
    window.history.replaceState = this.originalReplace;
  };

  /**
   * Trigger onRouteChange
   */
  handleRouteChange = (url: string, type: RouteType | 'init' | 'onpopstate'): void => {
    const { onRouteChange } = this.props;
    const { pathname, query } = urlParse(url, true);

    onRouteChange(pathname, query, type);
  };

  render() {
    const { NotFoundComponent, ErrorComponent, LoadingComponent, useShadow, children } = this.props;
    const { url } = this.state;

    const { pathname, query } = urlParse(url, true);
    const { localUrl } = query;

    let match: any = null;
    let element: any;

    React.Children.forEach(children, child => {
      if (match == null && React.isValidElement(child)) {
        element = child;

        const { path } = child.props as any;

        match = path ? matchPath(pathname, { ...child.props }) : null;
      }
    });

    const extraProps: any = {
      ErrorComponent,
      LoadingComponent,
      useShadow,
      forceRender: this.forceRender,
    };
    if (localUrl) {
      extraProps.url = localUrl;
    }

    let realComponent: any;
    if (match) {
      const { path, basename } = element.props as any;

      setIcestark('basename', basename || (Array.isArray(path) ? path[0] : path));

      realComponent = React.cloneElement(element, extraProps);
    } else {
      realComponent = (
        <AppRoute
          path={ICESTSRK_NOT_FOUND}
          url={ICESTSRK_NOT_FOUND}
          NotFoundComponent={NotFoundComponent}
          useShadow={useShadow}
        />
      );
    }
    return realComponent;
  }
}
