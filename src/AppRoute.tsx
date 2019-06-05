import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ICESTSRK_NOT_FOUND } from './constant';
import loadAssets from './util/loadAssets';
import emptyAssets from './util/emptyAssets';
import { setIcestark } from './util/index';

const nodeId = 'icestarkNode';

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
  forceRender?: boolean;
}

export default class AppRoute extends React.Component<AppRouteProps, AppRouteState> {
  static defaultProps = {
    exact: false,
    strict: false,
    sensitive: false,
  };

  state = {
    cssLoading: false,
  };

  private unmounted: boolean = false;

  componentDidMount() {
    setIcestark('root', null);
    this.renderChild();
  }

  componentDidUpdate(prevProps) {
    const { path, url, title, rootId, forceRender } = this.props;

    if (
      converArray2String(path) !== converArray2String(prevProps.path) ||
      converArray2String(url) !== converArray2String(prevProps.url) ||
      title !== prevProps.title ||
      rootId !== prevProps.rootId ||
      (forceRender && !prevProps.forceRender)
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

    // Prevent duplicate creation of shadowRoot
    const node: HTMLElement = document.querySelector(`#${rootId || nodeId}`);
    if (!node) return;

    root = node;
    // create ShadowRoot
    if (useShadow && !node.shadowRoot) {
      root = node.attachShadow
        ? node.attachShadow({ mode: 'open', delegatesFocus: false })
        : (node as any).createShadowRoot();
    }

    setIcestark('root', root);

    // empty useless assets before loading
    emptyAssets(useShadow);

    // Handle NotFound
    if (path === ICESTSRK_NOT_FOUND && url === ICESTSRK_NOT_FOUND) {
      React.isValidElement(NotFoundComponent)
        ? ReactDOM.render(NotFoundComponent, root)
        : ReactDOM.render(<NotFoundComponent />, root);
      return;
    }

    if (title) document.title = title;

    // generate bundleList
    const bundleList: string[] = Array.isArray(url) ? url : [`${url}/index.js`, `${url}/index.css`];

    // Handle loading
    this.setState({ cssLoading: true });
    if (LoadingComponent) {
      React.isValidElement(LoadingComponent)
        ? ReactDOM.render(LoadingComponent, root)
        : ReactDOM.render(<LoadingComponent />, root);
    }

    loadAssets(
      bundleList,
      useShadow,
      (err: any): boolean => {
        if (err) {
          // Handle error
          React.isValidElement(ErrorComponent)
            ? ReactDOM.render(ErrorComponent, root)
            : ReactDOM.render(<ErrorComponent />, root);
          return true;
        }

        return this.unmounted;
      },
      (): void => {
        this.setState({ cssLoading: false });
      },
    );
  };

  render() {
    const { path, title, rootId } = this.props;

    return (
      <div
        key={`${converArray2String(path)}-${title}`}
        id={rootId || nodeId}
        className={this.state.cssLoading ? 'ice-stark-loading' : 'ice-stark-loaded'}
      />
    );
  }
}
