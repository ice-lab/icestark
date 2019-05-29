import React from 'react';
import { Link } from 'react-router-dom';
import { AppLink } from '../../../../../lib/index';

export default function UserHome() {
  return (
    <div className="bg">
      <div className="title">B 仓库的 UserHome 页面 {'.bg { background: #ffce03; }'}</div>
      <Link to="/edit">跳到当前仓库的 UserEdit 页面</Link>
      <AppLink to="/home">仓库间跳转使用 AppLink 跳转到 A 仓库的 Home 页面</AppLink>
      <Link to="/xxxxx">跳转到 404 页面</Link>
    </div>
  );
}
