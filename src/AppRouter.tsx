import * as React from 'react';
import * as urlParse from 'url-parse';
import { default as AppRoute } from './AppRoute';
import { default as matchPath } from './matchPath';
import { ICESTSRK_404, setIcestark } from './constant';

type RouteType = 'pushState' | 'replaceState';

export interface AppRouterProps {
  onRouteChange?: (pathname: string, query: object, type: RouteType | 'init') => void;
  NotFoundComponent?: React.ReactType;
  ErrorComponent?: React.ReactType;
  LoadingComponent?: React.ReactType;
  useShadow?: boolean;
}

interface AppRouterState {
  url: string;
  forceRender: boolean;
}

export default class AppRouter extends React.Component<AppRouterProps, AppRouterState> {
  static defaultProps = {
    ErrorComponent: <div>js bundle loaded error</div>,
    useShadow: false,
  };

  state: AppRouterState = {
    url: location.href,
    forceRender: false,
  };

  private originalPush: (state: any, title: string, url?: string) => void;

  private originalReplace: (state: any, title: string, url?: string) => void;

  componentDidMount() {
    this.hijackHistory();
    this.handleRouteChange(location.href, 'init');
    setIcestark('handleNotFound', this.handleNotFound);
  }

  componentWillUnmount() {
    this.UnHijackHistory();
    setIcestark('handleNotFound', null);
  }

  /**
   * Render NotFoundComponent
   */
  handleNotFound = () => {
    this.setState({ url: ICESTSRK_404 });
    // Compatible processing return renderNotFound();
    return null;
  };

  /**
   * Hijack window.history
   */
  hijackHistory = (): void => {
    this.originalPush = window.history.pushState;
    this.originalReplace = window.history.replaceState;

    const self = this;
    // hijack route change
    const onRouteChange = (state: any, url: string, routeType?: RouteType): void => {
      // deal with forceRender
      if ((state && state.state && state.state.forceRender) || (state && state.forceRender)) {
        self.setState({ url, forceRender: true });
      } else if (self.state.forceRender) {
        self.setState({ forceRender: false });
      }

      // trigger onRouteChange
      self.handleRouteChange(url, routeType);
    };

    window.history.pushState = function(state: any, title: string, url?: string) {
      onRouteChange(state, url, 'pushState');
      self.originalPush.apply(window.history, arguments);
    };
    window.history.replaceState = function(state, title, url) {
      onRouteChange(state, url, 'replaceState');
      self.originalReplace.apply(window.history, arguments);
    };
  };

  /**
   * Unhijacking history
   */
  UnHijackHistory = (): void => {
    window.history.pushState = this.originalPush;
    window.history.replaceState = this.originalReplace;
  };

  /**
   * Trigger onRouteChange
   */
  handleRouteChange = (url: string, type: RouteType | 'init'): void => {
    const { onRouteChange } = this.props;
    const { pathname, query } = urlParse(url, true);

    onRouteChange(pathname, query, type);
  };

  render() {
    const { NotFoundComponent, ErrorComponent, LoadingComponent, useShadow, children } = this.props;
    const { url, forceRender } = this.state;

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
      forceRender,
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
          path={ICESTSRK_404}
          url={ICESTSRK_404}
          NotFoundComponent={NotFoundComponent}
          useShadow={useShadow}
        />
      );
    }
    return realComponent;
  }
}
