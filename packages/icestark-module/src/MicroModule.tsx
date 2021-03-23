import * as React from 'react';
import { unmoutModule, loadModule, getModules, registerModules, ISandbox, StarkModule } from './modules';

/**
 * Render Component, compatible with Component and <Component>
 */
export function renderComponent(Component: any, props = {}): React.ReactElement {
  return React.isValidElement(Component) ? (
    React.cloneElement(Component, props)
  ) : (
    // eslint-disable-next-line react/jsx-filename-extension
    <Component {...props} />
  );
}

/**
 * default render compoent, mount all modules
 */
export default class MicroModule extends React.Component<any, { loading: boolean }> {
  private moduleInfo = null;

  private mountNode = null;

  private unmout = false;

  static defaultProps = {
    loadingComponent: null,
    handleError: () => {},
  };

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
    if (prevProps !== this.props) {
      this.mountModule();
    }
  }

  componentWillUnmount() {
    try {
      unmoutModule(this.moduleInfo, this.mountNode);
      this.unmout = true;
    } catch (error) {
      console.log('[icestark] error occurred when unmount module');
    }
  }

  async mountModule() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sandbox, moduleInfo, wrapperClassName, wrapperStyle, loadingComponent, handleError, ...rest } = this.props;
    this.moduleInfo = moduleInfo || getModules().filter(m => m.name === this.props.moduleName)[0];
    if (!this.moduleInfo) {
      console.error(`Can't find ${this.props.moduleName} module in modules config`);
      return;
    }
    this.setState({ loading: true });
    try {
      const { mount, component } =  await loadModule(this.moduleInfo, sandbox);
      const lifecycleMount = mount;
      this.setState({ loading: false });
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

  render() {
    const { loading } = this.state;
    const { wrapperClassName, wrapperStyle, loadingComponent } = this.props;
    return loading ? loadingComponent
      : <div className={wrapperClassName} style={wrapperStyle} ref={ref => this.mountNode = ref} />;
  }
};

/**
 * Render Modules, compatible with Render and <Render>
 */
export function renderModules(modules: StarkModule[], render: any, componentProps?: any, sandbox?: ISandbox): React.ReactElement {
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
};