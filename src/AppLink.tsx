import * as React from 'react';

export type AppLinkProps = {
  to: string;
  hashType?: boolean;
  replace?: boolean;
  message?: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<any>;

const AppLink: React.SFC<AppLinkProps> = (props: AppLinkProps) => {
  const { to, hashType, replace, message, children, ...rest } = props;
  const linkTo = hashType && to.indexOf('#') === -1 ? `/#${to}` : to;
  return (
    <a
      {...rest}
      href={linkTo}
      onClick={e => {
        e.preventDefault();
        if (message && window.confirm(message) === false) {
          return false;
        }

        const changeState = window.history[replace ? 'replaceState' : 'pushState'];

        changeState({}, null, linkTo);
      }}
    >
      {children}
    </a>
  );
};

export default AppLink;
