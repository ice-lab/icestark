import React, { Component } from 'react';
import cx from 'classnames';
import { Icon, Nav } from '@alifd/next';
import { AppLink } from '../../../../../../src';
import Logo from '../Logo';
import { asideMenuConfig } from '../../../menuConfig';
import './index.scss';

const NavItem = Nav.Item;

export default class Aside extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openDrawer: false
    };
  }

  /**
   * Responsive switching menu through drawer form
   */
  toggleMenu = () => {
    const { openDrawer } = this.state;
    this.setState({
      openDrawer: !openDrawer
    });
  };

  /**
   * Left menu shrink switch
   */
  onMenuClick = () => {
    this.toggleMenu();
  };

  /**
   * Get menu item data
   */
  getNavMenuItems = menusData => {
    if (!menusData) {
      return [];
    }

    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map(item => {
        return (
          <NavItem icon={item.icon} key={item.key}>
            <AppLink to={item.path}>{item.name}</AppLink>
          </NavItem>
        );
      });
  };

  render() {
    const { openDrawer } = this.state;
    const { isMobile, pathname } = this.props;

    const menuAKeys = ['/', '/home', '/about', '/xxxxx'];
    let selectedKeys;
    if (menuAKeys.indexOf(pathname) >= 0) {
      selectedKeys = ['A'];
    } else {
      selectedKeys = ['B'];
    }

    return (
      <div className={cx('ice-design-layout-aside', { 'open-drawer': openDrawer })}>
        {isMobile && <Logo />}

        {isMobile && !openDrawer && (
          <a className="menu-btn" onClick={this.toggleMenu}>
            <Icon type="calendar" size="small" />
          </a>
        )}

        <Nav
          style={{ width: 200 }}
          direction="ver"
          activeDirection={null}
          onClick={this.onMenuClick}
          selectedKeys={selectedKeys}
        >
          {this.getNavMenuItems(asideMenuConfig)}
        </Nav>
      </div>
    );
  }
}
