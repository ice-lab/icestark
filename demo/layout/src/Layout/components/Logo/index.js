import React, { PureComponent } from 'react';
import { AppLink } from '../../../../../../src/index';

import './index.scss';

export default class Logo extends PureComponent {
  render() {
    return (
      <div className="logo">
        <AppLink to="/" className="logo-text">
          LOGO
        </AppLink>
      </div>
    );
  }
}
