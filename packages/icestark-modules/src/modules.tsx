import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Sandbox, { SandboxProps, SandboxContructor } from '@ice/sandbox';
import ModuleLoader, { StarkModule } from './loader';

type ISandbox = boolean | SandboxProps | SandboxContructor;

let globalModules = [];
const importModules = {};

export const moduleLoader = new ModuleLoader();

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
 * support react module render
 */
const defaultMount = (Component: any, targetNode: HTMLElement, props?: any) => {
  console.warn('Please set mount, try run react mount function');
  try {
    ReactDOM.render(renderComponent(Component, props), targetNode);
  } catch(err) {}
};

/**
 * default unmount function
 */
const defaultUnmount = (targetNode: HTMLElement) => {
  console.warn('Please set unmount, try run react unmount function');
  try {
    ReactDOM.unmountComponentAtNode(targetNode);
  } catch(err) {}
};

function createSandbox(sandbox: ISandbox) {
  let moduleSandbox = null;
  if (sandbox) {
    if (typeof sandbox === 'function') {
      // eslint-disable-next-line new-cap
      moduleSandbox = new sandbox();
    } else {
      const sandboxProps = typeof sandbox === 'boolean' ? {} : sandbox;
      moduleSandbox = new Sandbox(sandboxProps);
    }
  }
  return moduleSandbox;
}

/**
 * default render compoent, mount all modules
 */
export class MicroModule extends React.Component<any, {}> {
  mountModule = null;
  mountNode = null;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.mountModules();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.modules !== this.props.modules || prevProps.name !== this.props.name) {
      this.mountModules();
    }
  }

  componentWillUnmount() {
    unmoutModule(this.mountModule, this.mountNode);
  }

  mountModules() {
    this.mountModule = getModules().filter(module => module.name === this.props.name)[0];
    if (!this.mountModule) {
      console.error(`Can't find ${this.props.name} module in modules config`);
      return;
    }

    mountModule(this.mountModule, this.mountNode, this.props);
  }

  render() {
    return (<div ref={ref => this.mountNode = ref} />);
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
  let moduleSandbox = null;
  if (!importModules[name]) {
    moduleSandbox = createSandbox(sandbox);
    const module = await moduleLoader.execModule(targetModule, moduleSandbox);
    importModules[name] = {
      module,
      moduleSandbox,
    };
  }

  const module = importModules[name].module;

  if (!module) {
    console.error('load or exec module faild');
    return;
  }

  const mount = targetModule.mount || module.mount || defaultMount;
  const component = module.default || module;

  return mount(component, targetNode, props);
};

/**
 * unmount module function
 */
export const unmoutModule = (targetModule: StarkModule, targetNode: HTMLElement) => {
  const { name } = targetModule;
  const module = importModules[name]?.module;
  const moduleSandbox = importModules[name]?.moduleSandbox;
  const unmount = targetModule.unmount || module?.unmount || defaultUnmount;

  if (moduleSandbox?.clear) {
    moduleSandbox.clear();
  }

  return unmount(targetNode);
};

/**
 * Render Modules, compatible with Render and <Render>
 */
export default function renderModules(modules: StarkModule[], render: any, componentProps?: any): React.ReactElement {
  // save match app modules in global
  globalModules = modules;

  if (render) {
    return renderComponent(render, {
      modules,
      ...componentProps,
    });
  }

  console.warn('Please set render Component, try use MicroModule and mount first module');
  return <MicroModule name={modules[0]?.name} modules={modules} {...componentProps} />;
};
