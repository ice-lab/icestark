import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ICESTSRK_NOT_FOUND } from './constant';
import loadAssets from './util/loadAssets';
import emptyAssets from './util/emptyAssets';
import { setIcestark } from './util/index';

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

export interface AppRouteProps {
  path: string | string[];
  url: string | string[];
  useShadow: boolean;
  title?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  rootId?: string;
  ErrorComponent?: any;
  LoadingComponent?: any;
  NotFoundComponent?: any;
  forceRenderCount?: number;
}

export default class AppRoute extends React.Component<AppRouteProps, AppRouteState> {
  static defaultProps = {
    exact: false,
    strict: false,
    sensitive: false,
    rootId: 'icestarkNode',
  };

  state = {
    cssLoading: false,
  };

  private myRefBase: HTMLDivElement = null;

  private statusElement: HTMLDivElement = null;

  private unmounted: boolean = false;

  componentDidMount() {
    setIcestark('root', null);
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
      this.renderChild();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    setIcestark('root', null);
  }

  /**
   * Load assets and render child app
   */
  renderChild = () => {
    const {
      path,
      url,
      title,
      rootId,
      ErrorComponent,
      LoadingComponent,
      NotFoundComponent,
      useShadow,
    } = this.props;


    const myBase: HTMLElement = this.myRefBase;
    if (!myBase) return;

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

    setIcestark('root', rootElement);

    // Empty useless assets before loading
    emptyAssets(useShadow);

    // Handle NotFound
    if (path === ICESTSRK_NOT_FOUND && url === ICESTSRK_NOT_FOUND) {
      this.renderStatusElement(NotFoundComponent);
      return;
    }

    if (title) document.title = title;

    // Generate bundleList
    const bundleList: string[] = Array.isArray(url) ? url : [url];

    // Handle loading
    this.setState({ cssLoading: true });
    if (LoadingComponent) {
      this.renderStatusElement(LoadingComponent);
    }

    loadAssets(
      bundleList,
      useShadow,
      (err: any): boolean => {
        if (err) {
          // Handle error
          this.renderStatusElement(ErrorComponent);
          return true;
        }

        this.removeElementFromBase(statusElementId);
        this.statusElement = null;
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
  renderStatusElement = (Component) => {
    if (!this.statusElement) {
      this.statusElement = this.appendElementToBase(statusElementId);
    }

    const statusElement = this.statusElement;
    ReactDOM.unmountComponentAtNode(statusElement);
    React.isValidElement(Component)
      ? ReactDOM.render(Component, statusElement)
      : ReactDOM.render(<Component />, statusElement);
  }

  appendElementToBase = (elementId) => {
    const myBase = this.myRefBase;
    if (!myBase) return;

    const element = document.createElement('div');
    element.id = elementId;
    myBase.appendChild(element);
    return element;
  }

  removeElementFromBase = (elementId) => {
    const myBase = this.myRefBase;
    if (!myBase) return;

    const element = myBase.querySelector(`#${elementId}`);
    if (element) {
      myBase.removeChild(element);
    }
  }

  render() {
    const { path, title } = this.props;

    return (
      <div
        key={`${converArray2String(path)}-${title}`}
        ref={(element) => {this.myRefBase = element}}
        className={this.state.cssLoading ? 'ice-stark-loading' : 'ice-stark-loaded'}
      />
    );
  }
}
