import * as React from 'react';
import formatUrl from './util/formatUrl';

export type AppLinkProps = {
  to: string;
  hashType?: boolean;
  replace?: boolean;
  message?: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<Element>;

const AppLink = (props: AppLinkProps) => {
  const { to, hashType, replace, message, children, ...rest } = props;
  const linkTo = formatUrl(to, hashType);
  return (
    <a
      {...rest}
      href={linkTo}
      onClick={(e) => {
        e.preventDefault();
        // eslint-disable-next-line no-alert
        if (message && window.confirm(message) === false) {
          return false;
        }

        /*
        * Bind `replaceState` and `pushState` to window to avoid illegal invocation error
         */
        const changeState = window.history[replace ? 'replaceState' : 'pushState'].bind(window);

        changeState({}, null, linkTo);
      }}
    >
      {children}
    </a>
  );
};

export default AppLink;
