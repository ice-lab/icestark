import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg">
      <div className="title">A 仓库的 About 页面 {'.bg { background: white; }'}</div>
      <Link to="/home">跳转到 A 仓库的 Home 页面</Link>
    </div>
  );
}
