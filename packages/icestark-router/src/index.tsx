import * as React from 'react';
import { getBasename } from '@ice/stark';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

interface MyRoute {
  component: any;
  path: string | string[];
  key?: string;
  name?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

export interface StarkRouterProps {
  routes: MyRoute[];
}

const StarkRouter: React.SFC<StarkRouterProps> = (props: StarkRouterProps) => {
  const { routes } = props;
  return (
    <Router basename={getBasename()}>
      <Switch>
        {routes.map(route => {
          const { key, name, component, ...others } = route;
          return <Route key={key || name} {...others} component={component} />;
        })}
      </Switch>
    </Router>
  );
};

export default StarkRouter;
