import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { loadAssets, emptyAssets } from './loadAssets';
import { ICESTSRK_404, setIcestark } from './constant';

const nodeId = 'icestarkNode';

const getValidStr = (ele: string | string[]) => {
  if (Array.isArray(ele)) {
    return ele.join(',');
  }

  return String(ele);
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
  ErrorComponent?: React.ReactType;
  LoadingComponent?: React.ReactType;
  NotFoundComponent?: React.ReactType;
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
    const { path, url, title, forceRender } = this.props;

    if (
      getValidStr(path) !== getValidStr(prevProps.path) ||
      getValidStr(url) !== getValidStr(prevProps.url) ||
      title !== prevProps.title ||
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
      ErrorComponent,
      LoadingComponent,
      NotFoundComponent,
      useShadow,
    } = this.props;

    let root: any;

    // Prevent duplicate creation of shadowRoot
    const node: HTMLElement = document.querySelector(`#${nodeId}`);
    if (!node) return;

    root = node;
    // create ShadowRoot
    if (useShadow) {
      root = node.attachShadow
        ? node.attachShadow({ mode: 'open', delegatesFocus: false })
        : (node as any).createShadowRoot();
    }

    setIcestark('root', root);

    // empty useless assets before loading
    emptyAssets(useShadow);

    // Handle NotFound
    if (path === ICESTSRK_404 && url === ICESTSRK_404) {
      ReactDOM.render(<NotFoundComponent />, root);
      return;
    }

    if (title) document.title = title;

    // generate bundleList
    const bundleList: string[] = Array.isArray(url) ? url : [`${url}/index.js`, `${url}/index.css`];

    // Handle loading
    this.setState({ cssLoading: true });
    if (LoadingComponent) {
      ReactDOM.render(<LoadingComponent />, root);
    }

    loadAssets(
      bundleList,
      useShadow,
      (err: any): boolean => {
        if (err) {
          // Handle error
          ReactDOM.render(<ErrorComponent />, root);
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
    const { path, title } = this.props;

    return (
      <div
        key={`${getValidStr(path)}-${title}`}
        id={nodeId}
        className={this.state.cssLoading ? 'ice-stark-loading' : 'ice-stark-loaded'}
      />
    );
  }
}
