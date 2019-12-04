import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppHistory } from './appHistory';
import { loadAssets, emptyAssets } from './handleAssets';
import { setCache, getCache } from './cache';

const statusElementId = 'icestarkStatusContainer';

const converArray2String = (list: string | string[]) => {
  if (Array.isArray(list)) {
    return list.join(',');
  }

  return String(list);
};

interface AppRouteState {
  cssLoading: boolean;
}

// "slash" - hashes like #/ and #/sunshine/lollipops
// "noslash" - hashes like # and #sunshine/lollipops
// "hashbang" - “ajax crawlable” (deprecated by Google) hashes like #!/ and #!/sunshine/lollipops
type hashType = 'hashbang' | 'noslash' | 'slash';

interface Match<Params extends { [K in keyof Params]?: string } = {}> {
  params: Params;
  isExact: boolean;
  path: string;
  url: string;
}

interface Location<Query extends { [K in keyof Query]?: string } = {}> {
  pathname: string;
  query: Query;
  hash: string;
}

export interface AppRouteComponentProps<Params extends { [K in keyof Params]?: string } = {}> {
  match: Match<Params>;
  location: Location;
  history: AppHistory;
}

export interface AppConfig {
  title?: string;
  hashType?: boolean | hashType;
  basename?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  rootId?: string;
}

export interface AppRouteProps extends AppConfig {
  path: string | string[];
  url?: string | string[];
  useShadow?: boolean;
  ErrorComponent?: any;
  LoadingComponent?: any;
  component?: React.ReactElement;
  render?: (props?: AppRouteComponentProps) => React.ReactElement;
  forceRenderCount?: number;
  onAppEnter?: (appConfig: AppConfig) => void;
  onAppLeave?: (appConfig: AppConfig) => void;
  shouldAssetsRemove?: (assetUrl?: string) => boolean;
}

interface StatusComponentProps {
  err?: any;
}

/**
 * Get app config from AppRoute props
 */
function getAppConfig(appRouteProps: AppRouteProps): AppConfig {
  const appConfig: AppConfig = {};
  const uselessList = [
    'forceRenderCount',
    'url',
    'useShadow',
    'ErrorComponent',
    'LoadingComponent',
    'onAppEnter',
    'onAppLeave',
  ];

  Object.keys(appRouteProps).forEach(key => {
    if (uselessList.indexOf(key) === -1) {
      appConfig[key] = appRouteProps[key];
    }
  });

  return appConfig;
}

export default class AppRoute extends React.Component<AppRouteProps, AppRouteState> {
  state = {
    cssLoading: false,
  };

  private myRefBase: HTMLDivElement = null;

  private unmounted: boolean = false;

  private prevAppConfig: AppConfig = null;

  static defaultProps = {
    useShadow: false,
    exact: false,
    strict: false,
    sensitive: false,
    rootId: 'icestarkNode',
    shouldAssetsRemove: () => true,
  };

  componentDidMount() {
    setCache('root', null);
    this.renderChild();
  }

  componentDidUpdate(prevProps) {
    const { path, url, title, rootId, forceRenderCount } = this.props;

    if (
      converArray2String(path) !== converArray2String(prevProps.path) ||
      converArray2String(url) !== converArray2String(prevProps.url) ||
      title !== prevProps.title ||
      rootId !== prevProps.rootId ||
      forceRenderCount !== prevProps.forceRenderCount
    ) {
      // record config for prev App
      this.prevAppConfig = getAppConfig(prevProps);

      this.renderChild();
    }
  }

  componentWillUnmount() {
    // Empty useless assets before unmount
    const { useShadow, shouldAssetsRemove } = this.props;
    emptyAssets(useShadow, shouldAssetsRemove);
    this.triggerPrevAppLeave();
    this.unmounted = true;
    setCache('root', null);
  }

  /**
   * Load assets and render child app
   */
  renderChild = (): void => {
    const {
      url,
      title,
      rootId,
      ErrorComponent,
      LoadingComponent,
      useShadow,
      onAppEnter,
      shouldAssetsRemove,
    } = this.props;

    const myBase: HTMLElement = this.myRefBase;
    if (!myBase) return;

    this.triggerPrevAppLeave();

    // ReCreate rootElement to remove React Component instance,
    // rootElement is created for render Child App
    this.removeElementFromBase(rootId);
    let rootElement: any = this.appendElementToBase(rootId);

    // prevent duplicate creation of shadowRoot
    if (useShadow && !rootElement.shadowRoot) {
      rootElement = rootElement.attachShadow
        ? rootElement.attachShadow({ mode: 'open', delegatesFocus: false })
        : (rootElement as any).createShadowRoot();
    }

    setCache('root', rootElement);

    // empty useless assets before loading
    emptyAssets(useShadow, shouldAssetsRemove);

    if (title) document.title = title;

    // generate bundleList
    const bundleList: string[] = Array.isArray(url) ? url : [url];

    // handle loading
    this.setState({ cssLoading: true });
    this.renderStatusElement(LoadingComponent);

    if (typeof onAppEnter === 'function') onAppEnter(getAppConfig(this.props));

    loadAssets(
      bundleList,
      useShadow,
      (err: any): boolean => {
        if (err) {
          // Handle error
          this.renderStatusElement(ErrorComponent, { err });
          this.removeElementFromBase(rootId);
          this.setState({ cssLoading: false });
          return true;
        }

        this.removeElementFromBase(statusElementId);

        return this.unmounted;
      },
      (): void => {
        this.setState({ cssLoading: false });
      },
    );
  };

  /**
   * Render statusElement
   */
  renderStatusElement = (Component: any, props: StatusComponentProps = {}): void => {
    const myBase = this.myRefBase;
    if (!myBase || !Component) return;

    let statusElement = myBase.querySelector(`#${statusElementId}`);
    if (!statusElement) {
      statusElement = this.appendElementToBase(statusElementId);
    }

    ReactDOM.unmountComponentAtNode(statusElement);
    React.isValidElement(Component)
      ? ReactDOM.render(Component, statusElement)
      : ReactDOM.render(<Component {...props} />, statusElement);
  };

  appendElementToBase = (elementId: string): HTMLElement => {
    const myBase = this.myRefBase;
    if (!myBase) return;

    const element = document.createElement('div');
    element.id = elementId;
    myBase.appendChild(element);
    return element;
  };

  removeElementFromBase = (elementId: string): void => {
    const myBase = this.myRefBase;
    if (!myBase) return;

    const element = myBase.querySelector(`#${elementId}`);
    if (element) {
      myBase.removeChild(element);
    }
  };

  triggerPrevAppLeave = (): void => {
    const { onAppLeave } = this.props;

    // trigger registerAppLeaveCallback
    const registerAppLeaveCallback = getCache('appLeave');

    if (registerAppLeaveCallback) {
      registerAppLeaveCallback();
      setCache('appLeave', null);
    }

    // trigger onAppLeave
    const prevAppConfig = this.prevAppConfig;

    if (prevAppConfig) {
      if (typeof onAppLeave === 'function') onAppLeave(prevAppConfig);
      this.prevAppConfig = null;
    }
  };

  render() {
    const { path, title } = this.props;

    return (
      <div
        key={`${converArray2String(path)}-${title}`}
        ref={element => {
          this.myRefBase = element;
        }}
        className={this.state.cssLoading ? 'ice-stark-loading' : 'ice-stark-loaded'}
      />
    );
  }
}
