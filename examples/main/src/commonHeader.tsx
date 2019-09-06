import React from 'react';
import { Menu } from 'antd';
import { appHistory } from '@ice/stark';

interface ClickParam {
  key: string;
  keyPath: Array<string>;
  item: any;
  domEvent: Event;
}

class CommonHeader extends React.Component<{}, {}> {
  state = {
    current: '/'
  }

  handleClick = (e: ClickParam) => {
    this.setState({
      current: e.key,
    });
    appHistory.push(e.key);
  }
  
  render() {
    return (
      <Menu onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal" theme="dark">
        <Menu.Item key="/">商家平台</Menu.Item>
        <Menu.Item key="/waiter">小二平台</Menu.Item>
      </Menu>
    );
  }
}

export default CommonHeader;