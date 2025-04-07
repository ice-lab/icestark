import * as React from 'react';
import formatUrl from './util/formatUrl';

interface To {
  /**
   * A string representing the path link to
   */
  pathname: string;
  /**
   * A string representing the url search to
   */
  search?: string;
  /**
   * A string representing the url state to
   */
  state?: object;
}
export type AppLinkProps = {
  to: string | To;
  hashType?: boolean;
  replace?: boolean;
  message?: string;
  children?: React.ReactNode;
} & Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick' | 'href' | 'className' | 'style' | 'target'>;

const AppLink = (props: AppLinkProps) => {
  const { to, hashType, replace, message, children, ...rest } = props;

  const _to = typeof to === 'object' ? `${to.pathname}${to.search ?? ''}` : to;
  const _state = typeof to === 'object' ? to.state : {};

  const linkTo = formatUrl(_to, hashType);
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

        changeState(_state ?? {}, null, linkTo);
      }}
    >
      {children}
    </a>
  );
};

export default AppLink;
