import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Sandbox from '@ice/sandbox';
import ModuleLoader, { StarkModule } from './loader';

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

/**
 * default render compoent, mount all modules
 */
export class MicroModule extends React.Component<any, {}> {
  modules = [];
  nodeRefs = {};

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.modules = getModules();
    this.mountModules();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.modules !== this.props.modules) {
      this.modules = getModules();
      this.mountModules();
    }
  }

  componentWillUnmount() {
    const { nodeRefs } = this;

    this.modules.map(module => {
      const { name } = module;
      const renderNode = nodeRefs[name];
      unmoutModule(module, renderNode);
    });
  }

  mountModules() {
    this.modules.map(module => {
      // get ref node
      const renderNode = this.nodeRefs[module.name];

      // mount module
      mountModule(module, renderNode, this.props);
    });
  }

  render() {
    const modules = getModules();

    return (<div>
      {modules.map(({ name }, index) => (
        <div key={name || index} ref={ref => this.nodeRefs[name] = ref} id={name} />
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
