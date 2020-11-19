import * as React from 'react';

export type AppLinkProps = {
  to: string;
  hashType?: boolean;
  replace?: boolean;
  message?: string;
  children?: React.ReactNode;
  tag?: string;
} & React.AnchorHTMLAttributes<any>;

const AppLink: React.SFC<AppLinkProps> = (props: AppLinkProps) => {
  const { to, hashType, replace, message, children, tag, ...rest } = props;
  const linkTo = hashType && to.indexOf('#') === -1 ? `/#${to}` : to;

  return React.createElement(
    tag ?? 'a',
    Object.assign({}, rest, {
      href: linkTo,
      onClick: (e) => {
        e.preventDefault();

        if (message && window.confirm(message) === false) {
          return false;
        }

        const changeState = window.history[replace ? 'replaceState' : 'pushState'];
        changeState({}, null, linkTo);
      },
    }),
    children,
  );
};

export default AppLink;
