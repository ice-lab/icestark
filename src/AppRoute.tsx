import * as React from 'react';
import renderComponent from './util/renderComponent';
import { AppHistory } from './appHistory';
import { setCache } from './util/cache';
import { loadMicroApp, unloadMicroApp, BaseConfig } from './apps';

interface AppRouteState {
  showComponent: boolean;
}

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

// from AppRouter
export interface AppRouteProps extends BaseConfig {
  componentProps?: AppRouteComponentProps;
  cssLoading?: boolean;
  rootId?: string;
  component?: React.ComponentType;
  render?: (componentProps: AppRouteComponentProps) => React.ComponentType;
}

export default class AppRoute extends React.Component<AppRouteProps, AppRouteState> {
  state = {
    showComponent: false,
  };

  private myRefBase: HTMLDivElement = null;

  static defaultProps = {
    exact: false,
    strict: false,
    sensitive: false,
    sandbox: false,
    rootId: 'icestarkNode',
    shouldAssetsRemove: () => true,
  };

  componentDidMount() {
    if (this.validateRender()) {
      this.setState({ showComponent: true });
    } else {
      this.renderChild();
    }
  }

  componentWillUnmount() {
    const { name } = this.props;
    unloadMicroApp(name);
  }

  renderChild = (): void => {
    const { path, name, rootId, ...rest } = this.props;
    // reCreate rootElement to remove sub-application instance,
    // rootElement is created for render sub-application
    const rootElement: HTMLElement = this.reCreateElementInBase(rootId);

    setCache('root', rootElement);

    
    loadMicroApp({
      ...rest,
      name,
      activePath: path,
      container: rootElement,
    });
  }

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
  }

  validateRender() {
    const { render } = this.props;
    return render && typeof render === 'function';
  }

  render() {
    const { render, component, componentProps } = this.props;
    const { showComponent } = this.state;
    if (component) {
      return showComponent ? renderComponent(component, componentProps) : null;
    }
    if (render && typeof render === 'function') {
      return showComponent? render(componentProps) : null;
    }
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <div
        ref={element => {
          this.myRefBase = element;
        }}
        className='ice-stark-loaded'
      />
    );
  }
}
