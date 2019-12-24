import * as React from 'react';

export type AppLinkProps = {
  to: string;
  replace?: boolean;
  message?: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<any>;

const AppLink: React.SFC<AppLinkProps> = (props: AppLinkProps) => {
  const { to, replace, message, children, ...rest } = props;
  return (
    <a
      {...rest}
      href={to}
      onClick={e => {
        e.preventDefault();
        if (message && window.confirm(message) === false) {
          return false;
        }

        const changeState = window.history[replace ? 'replaceState' : 'pushState'];

        changeState({}, null, to);
      }}
    >
      {children}
    </a>
  );
};

export default AppLink;
