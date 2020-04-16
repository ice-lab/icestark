import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Sandbox from '@ice/sandbox';
import ModuleLoader, { StarkModule } from './loader';

const { createRef } = React;
let globalModules = [];
let importModules = {};

if (!(window as any)?.proxyWindow) {
  window.proxyWindow = new Sandbox();
}

export const moduleLoader = new ModuleLoader();

declare global {
  interface Window {
    proxyWindow?: Sandbox;
  }
}

/**
 * support react module render
 */
const defaultMount = (Component: any, targetNode: HTMLElement, props?: any) => {
  ReactDOM.render(renderComponent(Component, props), targetNode);
};

/**
 * default unmount function
 */
const defaultUnmount = (targetNode: HTMLElement) => {
  // do something
};

/**
 * Render Component, compatible with Component and <Component>
 */
export function renderComponent(Component: any, props = {}): React.ReactElement {
  return React.isValidElement(Component) ? (
    React.cloneElement(Component, props)
  ) : (
    <Component {...props} />
  );
}

interface MicroModuleState {
  renderNodeList: React.RefObject<HTMLDivElement>[];
}

/**
 * default render compoent, mount all modules
 */
export class MicroModule extends React.Component<any, MicroModuleState> {
  modules = [];

  constructor(props) {
    super(props);
    this.state = {
      renderNodeList: this.getRefs(),
    };
  }

  componentDidMount() {
    this.mountModules();
  }

  componentDidUpdate(prevProps, preState) {
    if (prevProps.modules !== this.props.modules) {
      this.setState({
        renderNodeList: this.getRefs(),
      });
    }
    if (preState.renderNodeList !== this.state.renderNodeList) {
      this.mountModules();
    }
  }

  componentWillUnmount() {
    const { renderNodeList } = this.state;

    this.modules.map((module, index) => {
      const renderNode = renderNodeList[index].current;
      unmoutModule(module, renderNode);
    });
  }

  getRefs() {
    this.modules = getModules();
    return this.modules.map((): React.RefObject<HTMLDivElement> => createRef());
  }

  mountModules() {
    this.modules.map((module, index) => {
      // get ref current node
      const renderNode = this.state.renderNodeList[index].current;

      // mount module
      mountModule(module, renderNode, this.props);
    });
  }

  render() {
    const { renderNodeList } = this.state;

    return (<div>
      {renderNodeList.map((node, index) => (
        <div key={this.modules[index].name || index} ref={node} id={this.modules[index].name} />
      ))}
    </div>);
  }


};

/**
 * return globalModules
*/
export const getModules = function () {
  return globalModules || [];
};

/**
 * mount module function
 */
export const mountModule = async (targetModule: StarkModule, targetNode: HTMLElement, props: any = {}) => {
  const { name } = targetModule;

  if (!importModules[name]) {
    importModules[name] = await moduleLoader.execModule(targetModule);
  }

  const module = importModules[name];
  const mount = targetModule.mount || module.mount || defaultMount;
  const component = module.default || module;

  // clear proxyWindow
  if (window?.proxyWindow?.clear) {
    window.proxyWindow.clear();
  }

  return mount(component, targetNode, props);
};

/**
 * unmount module function
 */
export const unmoutModule = (targetModule: StarkModule, targetNode: HTMLElement) => {
  const { name } = targetModule;
  const module = importModules[name];
  const unmount = targetModule.unmount || module.unmount || defaultUnmount;
  return unmount(targetNode);
};

/**
 * Render Modules, compatible with Render and <Render>
 */
export default function renderModules(modules: StarkModule[], render: any, componentProps?: any): React.ReactElement {
  // save match app modules in global
  globalModules = modules;

  const Component = renderComponent(render || MicroModule, {
    modules,
    ...componentProps,
  });

  return Component;
};
