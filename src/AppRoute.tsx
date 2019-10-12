import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { loadAssets, emptyAssets } from './handleAssets';
import { ICESTSRK_NOT_FOUND } from './constant';
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
  url: string | string[];
  useShadow?: boolean;
  ErrorComponent?: any;
  LoadingComponent?: any;
  NotFoundComponent?: any;
  forceRenderCount?: number;
  onAppEnter?: (appConfig: AppConfig) => void;
  onAppLeave?: (appConfig: AppConfig) => void;
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
    'NotFoundComponent',
    'useShadow',
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

  private triggerNotFound: boolean = false;

  static defaultProps = {
    useShadow: false,
    exact: false,
    strict: false,
    sensitive: false,
    rootId: 'icestarkNode',
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
      const prevAppConfig = getAppConfig(prevProps);

      this.renderChild(prevAppConfig);
    }
  }

  componentWillUnmount() {
    // Empty useless assets before unmount
    const { useShadow } = this.props;
    emptyAssets(useShadow);
    this.unmounted = true;
    setCache('root', null);
  }

  /**
   * Load assets and render child app
   */
  renderChild = (prevAppConfig?: AppConfig): void => {
    const {
      path,
      url,
      title,
      rootId,
      ErrorComponent,
      LoadingComponent,
      NotFoundComponent,
      useShadow,
      onAppEnter,
      onAppLeave,
    } = this.props;

    const myBase: HTMLElement = this.myRefBase;
    if (!myBase) return;

    if (prevAppConfig) {
      // trigger registerAppLeaveCallback
      const registerAppLeaveCallback = getCache('appLeave');

      if (registerAppLeaveCallback) {
        registerAppLeaveCallback();
        setCache('appLeave', null);
      }

      // trigger onAppLeave
      if (typeof onAppLeave === 'function') onAppLeave(prevAppConfig);
    }

    // ReCreate rootElement to remove React Component instance,
    // rootElement is created for render Child App
    this.removeElementFromBase(rootId);
    let rootElement: any = this.appendElementToBase(rootId);

    // Prevent duplicate creation of shadowRoot
    if (useShadow && !rootElement.shadowRoot) {
      rootElement = rootElement.attachShadow
        ? rootElement.attachShadow({ mode: 'open', delegatesFocus: false })
        : (rootElement as any).createShadowRoot();
    }

    setCache('root', rootElement);

    // Empty useless assets before loading
    emptyAssets(useShadow);

    // Handle NotFound
    if (path === ICESTSRK_NOT_FOUND && url === ICESTSRK_NOT_FOUND) {
      // loadAssets callback maybe slower than render NotFoundComponent
      this.triggerNotFound = true;
      this.renderStatusElement(NotFoundComponent);
      return;
    }

    this.triggerNotFound = false;

    if (title) document.title = title;

    // Generate bundleList
    const bundleList: string[] = Array.isArray(url) ? url : [url];

    // Handle loading
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
          return true;
        }

        if (!this.triggerNotFound) {
          // loadAssets callback maybe slower than render NotFoundComponent
          this.removeElementFromBase(statusElementId);
        }

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
