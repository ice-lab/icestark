import * as React from 'react';
import { unmoutModule, loadModule, getModules, registerModules, ISandbox, StarkModule } from './modules';
import { shallowCompare } from './assist';

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

interface State {
  loading: boolean;
}

/**
 * default render component, mount all modules
 */
export default class MicroModule extends React.Component<any, State> {
  static defaultProps = {
    loadingComponent: null,
    handleError: () => {},
  };

  private moduleInfo = null;

  private mountNode = null;

  private unmout = false;

  // moduleInfo 中定义的 mount 函数
  private moduleLifecycleMount = null;

  // 从 moduleInfo 配置中解析得到的模块组件
  private moduleComponent = null;

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
    const { moduleInfo: preModuleInfo = {}, ...preRest } = prevProps;
    const { moduleInfo: curModuleInfo = {}, mountId, ...curRest } = this.props;

    if (!shallowCompare(preModuleInfo, curModuleInfo)) {
      this.mountModule();
    }
    if (!shallowCompare(preRest, curRest)) {
      // 对于除 moduleInfo 外的 props 更新，重新渲染模块
      this.moduleLifecycleMount && this.moduleLifecycleMount(this.moduleComponent, this.mountNode || mountId, curRest);
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
        const { mount, component } = await loadModule(this.moduleInfo, this.props.sandbox);
        const lifecycleMount = mount;
        this.moduleLifecycleMount = mount;
        this.moduleComponent = component;

        !this.unmout && this.setState({ loading: false });
        if (lifecycleMount && component) {
          if (this.unmout) {
            unmoutModule(this.moduleInfo, this.mountNode);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { sandbox, moduleInfo, wrapperClassName, wrapperStyle, loadingComponent, handleError, mountId, ...rest } = this.props;
            lifecycleMount(component, this.mountNode || mountId, rest);
          }
        }
      } catch (err) {
        this.setState({ loading: false });
        this.props.handleError(err);
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

    const { wrapperClassName, wrapperStyle, loadingComponent, mountId, ...restProps } = this.props;
    const nodeProps = {
      className: wrapperClassName,
      style: wrapperStyle,
      ref: (ref) => { this.mountNode = ref; },
      ...(mountId ? { id: mountId } : {}),
    };
    return loading
      ? loadingComponent
      : (
        <div
          {...nodeProps}
        >
          { this.moduleInfo && this.validateRender() && render(restProps) }
        </div>
      );
  }
}

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
}
