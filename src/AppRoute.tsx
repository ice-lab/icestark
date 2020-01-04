import * as React from 'react';
import { AppHistory } from './appHistory';
import renderComponent from './util/renderComponent';
import { loadEntry, loadEntryContent, appendAssets, emptyAssets } from './util/handleAssets';
import { setCache, getCache } from './util/cache';
import { callAppEnter, callAppLeave } from './util/appLifeCycle';
import { callCapturedEventListeners } from './util/capturedListeners';

interface AppRouteState {
  cssLoading: boolean;
  showComponent: boolean;
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

// from user config
export interface AppConfig {
  title?: string;
  useShadow?: boolean;
  hashType?: boolean | hashType;
  basename?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  rootId?: string;
  path: string | string[];
  url?: string | string[];
  entry?: string;
  entryContent?: string;
  component?: React.ReactElement;
  render?: (props?: AppRouteComponentProps) => React.ReactElement;
}

// from AppRouter
export interface AppRouteProps extends AppConfig {
  onAppEnter?: (appConfig: AppConfig) => void;
  onAppLeave?: (appConfig: AppConfig) => void;
  triggerLoading?: (loading: boolean) => void;
  triggerError?: (err: string) => void;
  shouldAssetsRemove?: (
    assetUrl?: string,
    element?: HTMLElement | HTMLLinkElement | HTMLStyleElement | HTMLScriptElement,
  ) => boolean;
  componentProps?: AppRouteComponentProps;
}

export function converArray2String(list: string | string[]) {
  if (Array.isArray(list)) {
    return list.join(',');
  }

  return String(list);
}

/**
 * Get app config from AppRoute props
 */
function getAppConfig(appRouteProps: AppRouteProps): AppConfig {
  const appConfig: AppConfig = { path: '' };
  const uselessList = ['onAppEnter', 'onAppLeave', 'triggerLoading', 'triggerError'];

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
    showComponent: false,
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

  shouldComponentUpdate(nextProps, nextState) {
    const { path, url, title, rootId, useShadow } = this.props;
    const { cssLoading, showComponent } = this.state;

    if (
      converArray2String(path) === converArray2String(nextProps.path) &&
      converArray2String(url) === converArray2String(nextProps.url) &&
      title === nextProps.title &&
      rootId === nextProps.rootId &&
      useShadow === nextProps.useShadow &&
      cssLoading === nextState.cssLoading &&
      showComponent === nextState.showComponent
    ) {
      // reRender is triggered by sub-application router / browser, call popStateListeners
      callCapturedEventListeners();
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    const { path, url, title, rootId, useShadow } = this.props;

    if (
      converArray2String(path) !== converArray2String(prevProps.path) ||
      converArray2String(url) !== converArray2String(prevProps.url) ||
      title !== prevProps.title ||
      rootId !== prevProps.rootId ||
      useShadow !== prevProps.useShadow
    ) {
      this.renderChild();
    }
  }

  componentWillUnmount() {
    // Empty useless assets before unmount
    const { shouldAssetsRemove } = this.props;

    emptyAssets(shouldAssetsRemove);
    this.triggerPrevAppLeave();
    this.unmounted = true;
    setCache('root', null);
  }

  /**
   * Load assets and render sub-application
   */
  renderChild = (): void => {
    const { rootId, useShadow, component, render } = this.props;

    // if component / render exists,
    // set showComponent to confirm capturedEventListeners triggered at the right time
    if (component || (render && typeof render === 'function')) {
      this.triggerPrevAppLeave();

      this.triggerOnAppEnter();

      this.setState({ showComponent: true });
      return;
    }

    const myBase: HTMLElement = this.myRefBase;
    if (!myBase) return;

    this.triggerPrevAppLeave();

    // reCreate rootElement to remove sub-application instance,
    // rootElement is created for render sub-application
    let rootElement: any = this.reCreateElementInBase(rootId);

    // prevent duplicate creation of shadowRoot
    if (useShadow && !rootElement.shadowRoot) {
      rootElement = rootElement.attachShadow
        ? rootElement.attachShadow({ mode: 'open', delegatesFocus: false })
        : (rootElement as any).createShadowRoot();
    }

    setCache('root', rootElement);

    this.loadNextApp(useShadow);
  };

  loadNextApp = async (useShadow?: boolean) => {
    const {
      path,
      url,
      entry,
      entryContent,
      title,
      triggerLoading,
      triggerError,
      onAppEnter,
      shouldAssetsRemove,
    } = this.props;
    // empty useless assets before loading
    emptyAssets(shouldAssetsRemove);

    if (title) document.title = title;

    const handleLoading = (loading: boolean): void => {
      // if AppRoute is unmounted, cancel all operations
      if (this.unmounted) return;

      const { cssLoading } = this.state;
      if (loading !== cssLoading) {
        this.setState({ cssLoading: loading, showComponent: false });
        typeof triggerLoading === 'function' && triggerLoading(loading);
      }
    };

    const handleError = (errMessage: string): void => {
      // if AppRoute is unmounted, cancel all operations
      if (this.unmounted) return;

      handleLoading(false);
      typeof triggerError === 'function' && triggerError(errMessage);
    };

    // trigger loading before handleAssets
    handleLoading(true);

    const currentAppConfig: AppConfig = this.triggerOnAppEnter();

    try {
      if (entry) {
        // entry for fetch -> process -> append
        const rootElement = getCache('root');
        await loadEntry(rootElement, entry);
      } else if (entryContent) {
        // entryContent for process -> append
        const rootElement = getCache('root');
        const cachedKey = title || converArray2String(path);
        await loadEntryContent(rootElement, entryContent, location.href, cachedKey);
      } else {
        const assetsList = Array.isArray(url) ? url : [url];
        await appendAssets(assetsList, useShadow);
      }

      // if AppRoute is unmounted, or current app is not the latest app, cancel all operations
      if (this.unmounted || this.prevAppConfig !== currentAppConfig) return;

      // trigger sub-application render
      callAppEnter();

      // cancel loading after handleAssets
      handleLoading(false);
    } catch (error) {
      handleError(error.message);
    }
  };

  reCreateElementInBase = (elementId: string): HTMLElement => {
    const myBase = this.myRefBase;
    if (!myBase) return;

    // remove all elements in base
    myBase.innerHTML = '';

    // create new rootElement
    const element = document.createElement('div');
    element.id = elementId;
    myBase.appendChild(element);
    return element;
  };

  /**
   * Trigger onAppLeave in AppRouter and callAppLeave(registerAppLeave callback)
   * reset this.prevAppConfig
   */
  triggerPrevAppLeave = (): void => {
    const { onAppLeave } = this.props;

    // trigger onAppLeave
    const prevAppConfig = this.prevAppConfig;

    if (prevAppConfig) {
      if (typeof onAppLeave === 'function') onAppLeave(prevAppConfig);
      this.prevAppConfig = null;
    }

    callAppLeave();
  };

  /**
   * Trigger onAppEnter in AppRouter
   * callAppEnter(registerAppEnter callback) will be triggered later
   * record current appConfig as this.prevAppConfig
   */
  triggerOnAppEnter = (): AppConfig => {
    const { onAppEnter } = this.props;

    const currentAppConfig = getAppConfig(this.props);
    this.prevAppConfig = currentAppConfig;

    // trigger onAppEnter
    if (typeof onAppEnter === 'function') onAppEnter(currentAppConfig);

    return currentAppConfig;
  };

  render() {
    const { component, render, componentProps } = this.props;
    const { cssLoading, showComponent } = this.state;

    if (component) {
      return showComponent ? renderComponent(component, componentProps) : null;
    }

    if (render && typeof render === 'function') {
      return showComponent ? render(componentProps) : null;
    }

    return (
      <div
        ref={element => {
          this.myRefBase = element;
        }}
        className={cssLoading ? 'ice-stark-loading' : 'ice-stark-loaded'}
      />
    );
  }
}
