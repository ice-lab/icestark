import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { AppLink } from '../../../../../lib/index';

@withRouter
export default class Home extends Component {
  render() {
    return (
      <div className="bg">
        <div className="title">A 仓库的 Home 页面 {'.bg { background: white; }'}</div>
        <Link to="/about">跳转到 A 仓库的 About 页面</Link>
        <AppLink to="/user/home">仓库间跳转使用 AppLink 跳转到 B 仓库的 UserHome 页面</AppLink>
        <Link to="/xxxxx">跳转到 404 页面</Link>
        <span
          onClick={() => {
            this.props.history.push('/about');
          }}
        >
          通过 history.push 跳转到 A 仓库的 About 页面
        </span>
      </div>
    );
  }
}
