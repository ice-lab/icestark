import * as React from 'react';
import { unmoutModule, loadModule, getModules, registerModules, ISandbox, StarkModule } from './modules';
import { shallowCompare } from './assist';

/**
 * Render Component, compatible with Component and <Component>
 */
export function renderComponent(Component: any, props = {}) {
  return React.isValidElement(Component) ? (
    React.cloneElement(Component, props)
  ) : (
    // eslint-disable-next-line react/jsx-filename-extension
    <Component {...props} />
  );
}

export interface ModuleInfo {
  name: string;
  url: string;
  mount: (component: React.ReactNode, node: HTMLElement, props?: any) => void;
  unmount: (node: HTMLElement) => void;
}

interface MicroModuleProps {
  moduleInfo?: ModuleInfo;
  moduleName?: string;
  sandbox?: ISandbox;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  loadingComponent?: React.ReactNode;
  handleError?: (err: Error) => void;
}

interface State {
  loading: boolean;
}

/**
 * default render component, mount all modules
 */
export default class MicroModule extends React.Component<MicroModuleProps, State> {
  static defaultProps = {
    loadingComponent: null,
    handleError: () => {},
  };

  state: State = {
    loading: false,
  };

  private moduleInfo = null;

  private mountNode = null;

  private unmout = false;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    this.mountModule();
  }

  componentDidUpdate(prevProps) {
    if (!shallowCompare(prevProps.moduleInfo || {}, this.props.moduleInfo || {})) {
      this.mountModule();
    }
  }

  componentWillUnmount() {
    try {
      if (!this.validateRender()) {
        unmoutModule(this.moduleInfo, this.mountNode);
      }
      this.unmout = true;
    } catch (error) {
      console.log('[icestark] error occurred when unmount module', error);
    }
  }

  getModuleInfo() {
    const { moduleInfo } = this.props;
    this.moduleInfo = moduleInfo || getModules().filter((m) => m.name === this.props.moduleName)[0];
    if (!this.moduleInfo) {
      console.error(`[icestark] Can't find ${this.props.moduleName} module in modules config`);
    }
  }

  validateRender() {
    const { render } = this.moduleInfo || {};

    if (render && typeof render !== 'function') {
      console.error('[icestark]: render should be funtion');
    }
    return render && typeof render === 'function';
  }

  async mountModule() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sandbox, moduleInfo, wrapperClassName, wrapperStyle, loadingComponent, handleError, ...rest } = this.props;

    if (!this.moduleInfo) {
      console.error(`Can't find ${this.props.moduleName} module in modules config`);
      return;
    }
    /**
     * if `render` was provided, render immediately
    */
    if (!this.validateRender()) {
      this.setState({ loading: true });

      try {
        const { mount, component } = await loadModule(this.moduleInfo, sandbox);
        const lifecycleMount = mount;

        !this.unmout && this.setState({ loading: false });
        if (lifecycleMount && component) {
          if (this.unmout) {
            unmoutModule(this.moduleInfo, this.mountNode);
          } else {
            lifecycleMount(component, this.mountNode, rest);
          }
        }
      } catch (err) {
        this.setState({ loading: false });
        handleError(err);
      }
    }
  }

  render() {
    /**
    * make sure moudleInfo is up to date.
    */
    this.getModuleInfo();

    const { loading } = this.state;
    const { render } = this.moduleInfo || {};

    const { wrapperClassName, wrapperStyle, loadingComponent } = this.props;
    return loading
      ? loadingComponent
      : (
        <div
          className={wrapperClassName}
          style={wrapperStyle}
          ref={(ref) => { this.mountNode = ref; }}
        >
          { this.moduleInfo && this.validateRender() && render() }
        </div>
      );
  }
}

/**
 * Render Modules, compatible with Render and <Render>
 */
export function renderModules(modules: StarkModule[], render: any, componentProps?: any, sandbox?: ISandbox) {
  // save match app modules in global
  registerModules(modules);

  if (render) {
    return renderComponent(render, {
      modules,
      ...componentProps,
      sandbox,
    });
  }

  console.warn('Please set render Component, try use MicroModule and mount first module');
  return <MicroModule moduleName={modules[0]?.name} {...componentProps} />;
}
