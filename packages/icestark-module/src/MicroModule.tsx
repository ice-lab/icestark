import * as React from 'react';
import {
  cloneElement,
  ComponentType,
  CSSProperties,
  isValidElement,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  unmoutModule,
  loadModule,
  getModules,
  registerModules,
  ISandbox,
  StarkModule,
  LifecycleMount,
} from './modules';
import { shallowCompare } from './assist';

/**
 * Render Component, compatible with Component and <Component>
 */
export function renderComponent(Component: ReactElement | ComponentType, props = {}): ReactElement {
  return isValidElement(Component) ? (
    cloneElement(Component, props)
  ) : (
    // eslint-disable-next-line react/jsx-filename-extension
    <Component {...props} />
  );
}

export interface MicroModuleProps {
  moduleName?: string;
  moduleInfo?: StarkModule;
  sandbox?: ISandbox;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
  loadingComponent?: ReactElement;
  handleError?: (err: any) => void;

  [x: string]: any;
}

/**
 * useMemo for moduleInfo, with shallowCompare
 * @param moduleInfo moduleInfo from props
 * @param moduleName moduleName from props
 * @returns moduleInfo or undefined
 */
function useModuleInfo(moduleInfo?: StarkModule, moduleName?: string): StarkModule | undefined {
  const [state, setState] = useState<StarkModule>();

  useEffect(() => {
    const next = moduleInfo || getModules().find((m) => m.name === moduleName);
    if (!next) {
      console.error(`[icestark] Can't find ${moduleName} module in modules config`);
    }

    setState((prev) => {
      return shallowCompare(prev, next) ? prev : next;
    });
  }, [moduleInfo, moduleName]);

  return state;
}

/**
 * useRef for moduleProps, with shallowCompare
 * @param moduleProps props for module
 * @returns props
 */
function useModuleProps(props?: Record<string, any>) {
  const [state, setState] = useState({});

  useEffect(() => {
    const next = props || {};
    setState((prev) => {
      return shallowCompare(prev, next) ? prev : next;
    });
  }, [props]);

  return state;
}

function isModuleHasValidRender(moduleInfo?: StarkModule) {
  const render = moduleInfo?.render;
  if (render) {
    if (typeof render === 'function') {
      return true;
    }

    console.error('[icestark]: render should be funtion');
  }

  return false;
}

/**
 * default render component, mount all modules
 */
export default function MicroModule({
  moduleInfo: inputModuleInfo,
  moduleName,
  sandbox,
  wrapperClassName,
  wrapperStyle,
  loadingComponent = null,
  handleError,
  ...inputModuleProps
}: MicroModuleProps) {
  const [loading, setLoading] = useState(false);

  const ref = useRef(null);
  const unmounted = useRef(false);
  const mountedInfo = useRef<StarkModule>();
  const mountedModule = useRef<{
    mount: LifecycleMount;
    component: ComponentType;
  }>();

  const moduleInfo = useModuleInfo(inputModuleInfo, moduleName);
  const moduleProps = useModuleProps(inputModuleProps);

  /**
   * If true, render in current React context instead of mounting.
   */
  const isRenderValid = useMemo(() => isModuleHasValidRender(moduleInfo), [moduleInfo]);

  const unmount = useCallback((info: StarkModule) => {
    unmoutModule(info, ref.current);
    mountedInfo.current = undefined;
    mountedModule.current = undefined;
  }, []);

  const mountModule = useCallback(
    async (rerender = false) => {
      if (!moduleInfo || unmounted.current || isModuleHasValidRender(moduleInfo)) {
        return;
      }

      if (rerender && mountedModule.current) {
        const { mount, component } = mountedModule.current;
        mount(component, ref.current, moduleProps);
        return;
      }

      setLoading(true);
      try {
        const { mount, component } = await loadModule(moduleInfo, sandbox);
        // Unmounted during load
        if (unmounted.current) {
          unmount(moduleInfo);
          return;
        }

        setLoading(false);
        mountedInfo.current = moduleInfo;
        mountedModule.current = { mount, component };

        if (mount && component) {
          mount(component, ref.current, moduleProps);
        }
      } catch (err) {
        setLoading(false);
        handleError?.(err);
      }
    },
    [moduleInfo, sandbox, moduleProps, handleError, unmount],
  );

  useEffect(() => {
    return () => {
      const info = mountedInfo.current;
      try {
        unmounted.current = true;
        if (info && !isModuleHasValidRender(info)) {
          unmount(info);
        }
      } catch (error) {
        console.log('[icestark] error occurred when unmount module', error);
      }
    };
  }, []);

  useEffect(() => {
    mountModule(mountedInfo.current === moduleInfo);
  }, [moduleInfo, moduleProps]);

  return loading ? (
    loadingComponent
  ) : (
    <div className={wrapperClassName} style={wrapperStyle} ref={ref}>
      {isRenderValid && moduleInfo.render(moduleInfo)}
    </div>
  );
}

/**
 * Render Modules, compatible with Render and <Render>
 */
export function renderModules(
  modules: StarkModule[],
  render: any,
  componentProps?: any,
  sandbox?: ISandbox,
): ReactElement {
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
