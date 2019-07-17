import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ICESTSRK_NOT_FOUND } from './constant';
import loadAssets from './util/loadAssets';
import emptyAssets from './util/emptyAssets';
import { setIcestark } from './util/index';

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

  private myRefComp: HTMLDivElement = null;

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

    let root: any;

    const node: HTMLElement = this.myRefBase;
    if (!node) return;

    // update rootElement to remove react instance
    let rootElement: HTMLDivElement = node.querySelector(`#${rootId}`)
    if (rootElement) {
      node.removeChild(rootElement);
    }

    rootElement = document.createElement('div');
    rootElement.id = rootId;
    node.appendChild(rootElement);

    root = rootElement;

    // Prevent duplicate creation of shadowRoot
    if (useShadow && !rootElement.shadowRoot) {
      root = rootElement.attachShadow
        ? rootElement.attachShadow({ mode: 'open', delegatesFocus: false })
        : (rootElement as any).createShadowRoot();
    }

    setIcestark('root', root);

    // empty useless assets before loading
    emptyAssets(useShadow);

    // Handle NotFound
    if (path === ICESTSRK_NOT_FOUND && url === ICESTSRK_NOT_FOUND) {
      this.renderComponent(NotFoundComponent);
      return;
    }

    if (title) document.title = title;

    // generate bundleList
    const bundleList: string[] = Array.isArray(url) ? url : [url];

    // Handle loading
    this.setState({ cssLoading: true });
    if (LoadingComponent) {
      this.renderComponent(LoadingComponent);
    }

    loadAssets(
      bundleList,
      useShadow,
      (err: any): boolean => {
        if (err) {
          // Handle error
          this.renderComponent(ErrorComponent);
          return true;
        }
        ReactDOM.unmountComponentAtNode(this.myRefComp);

        return this.unmounted;
      },
      (): void => {
        this.setState({ cssLoading: false });
      },
    );
  };

  renderComponent = (Component) => {
    const myRefComp = this.myRefComp;
    ReactDOM.unmountComponentAtNode(myRefComp);
    React.isValidElement(Component)
      ? ReactDOM.render(Component, myRefComp)
      : ReactDOM.render(<Component />, myRefComp);
  }

  render() {
    const { path, title } = this.props;

    return (
      <div
        key={`${converArray2String(path)}-${title}`}
        ref={(element) => {this.myRefBase = element}}
        className={this.state.cssLoading ? 'ice-stark-loading' : 'ice-stark-loaded'}
      >
        <div ref={(element) => {this.myRefComp = element}} />
      </div>
    );
  }
}
