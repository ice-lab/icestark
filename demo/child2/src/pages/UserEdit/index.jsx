import React, { Component } from 'react';
import { Link, Prompt } from 'react-router-dom';
import { AppLink } from '../../../../../lib/index';

export default class UserHome extends Component {
  confirmMessage = '确定离开吗？';

  componentWillMount() {
    // Close the page by browser, etc.
    this.unloadEvent = function(e) {
      e.returnValue = this.confirmMessage;
      return this.confirmMessage;
    };
    window.addEventListener('beforeunload', this.unloadEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unloadEvent);
  }

  render() {
    return (
      <div className="bg">
        <div className="title">
          B 仓库的 UserEdit 页面（跳出时需要 confirm 确认） {'.bg { background: #ffce03; }'}
        </div>
        <Link to="/home">跳到当前仓库的 UserHome 页面</Link>
        <AppLink to="/home" message={this.confirmMessage}>
          仓库间跳转使用 AppLink 跳转到 A 仓库的 Home 页面
        </AppLink>
        <Prompt message={this.confirmMessage} />
      </div>
    );
  }
}
