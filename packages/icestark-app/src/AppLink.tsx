/* eslint-disable react/jsx-filename-extension */
import * as React from 'react';
import formatUrl from './util/formatUrl';

export type AppLinkProps = {
  to: string;
  hashType?: boolean;
  replace?: boolean;
  message?: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<any>;

const AppLink = (props: AppLinkProps) => {
  const { to, hashType, replace, message, children, ...rest } = props;
  const linkTo = formatUrl(to, hashType);
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
