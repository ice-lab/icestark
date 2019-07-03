import * as React from 'react';
import { getBasename } from '@ice/stark';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import * as path from 'path';

interface MyChild {
  component: any;
  path: string | string[];
  redirect?: string;
  key?: string;
  name?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

interface MyRoute extends MyChild {
  children?: MyChild[];
}

export interface StarkRouterProps {
  routes: MyRoute[];
}

const RouteItem: React.SFC<MyChild> = (props: MyChild) => {
  const { redirect, path, key, ...others } = props;
  if (redirect) {
    return <Redirect exact key={key} from={path as string} to={redirect} />;
  }
  return <Route key={key} path={path} {...others} />;
};

const StarkRouter: React.SFC<StarkRouterProps> = (props: StarkRouterProps) => {
  const { routes } = props;
  return (
    <Router basename={getBasename()}>
      <Switch>
        {routes.map((route, id) => {
          const { children, component: RouteComponent, key, name, ...others } = route;
          return children ? (
            <Route
              {...others}
              key={key || name || `${id}`}
              render={props => (
                <RouteComponent {...others} {...props}>
                  <Switch>
                    {children.map((child, cId) => {
                      const { key: childKey, name: childName, path: childPath, ...others } = child;
                      return (
                        <RouteItem
                          {...others}
                          path={childPath && path.join(route.path as string, childPath as string)}
                          key={childKey || childName || `${id}-${cId}`}
                        />
                      );
                    })}
                  </Switch>
                </RouteComponent>
              )}
            />
          ) : (
            <RouteItem {...route} key={key || name || `${id}`} />
          );
        })}
      </Switch>
    </Router>
  );
};

export default StarkRouter;
