import * as React from 'react';

/**
 * Render Component, compatible with Component and <Component>
 */
export default function renderComponent(Component: any, props = {}): React.ReactElement {
  return React.isValidElement(Component) ? (
    React.cloneElement(Component, props)
  ) : (
    <Component {...props} />
  );
}
