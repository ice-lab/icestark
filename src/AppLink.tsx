import * as React from 'react';
import { createBrowserHistory } from 'history';

export type AppLinkProps = {
  to: string;
  message?: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<any>;

const history = createBrowserHistory();

const AppLink: React.SFC<AppLinkProps> = (props: AppLinkProps) => {
  const { to, message, children, ...rest } = props;
  return (
    <a
      {...rest}
      href={to}
      onClick={e => {
        e.preventDefault();
        if (message && confirm(message) === false) {
          return false;
        }
        history.push(to, {
          forceRender: true,
        });
      }}
    >
      {children}
    </a>
  );
};

export default AppLink;
