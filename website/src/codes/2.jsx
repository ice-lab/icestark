import React from 'react';

export default function Error2({ args }) {
  return (
    <>
      <h1>#2: You can not use loadScriptMode = import where dynamic import is not supported by browsers.</h1>
      <p>
        icestark 会使用 <a href="https://github.com/tc39/proposal-dynamic-import">Dynamic Import</a> 来 <a href='/blog/02-icestark-2-6-0'>加载 ES modules 应用</a>（当您为微应用提供了 <code>loadScriptMode = 'import'</code> 配置, <a href='/docs/api/ice-stark#loadscriptmode'>参考</a>）。
      </p>
      <p>这个错误表达的含义是：<b>在不支持 Dynamic Import 的浏览器中加载了 ESM 应用</b>。</p>
      <br />
      <h2>解决办法</h2>
      <p>加载 ESM 应用存在浏览器版本<a></a>限制：</p>
      <ul>
        <li>IE: 不支持</li>
        <li>Chrome: {`>=`} 63</li>
        <li>Safari: {`>`} 11 </li>
        <li>Firfox: {`>=`} 67</li>
      </ul>
      <p>更换或更新浏览器版本以支持 Dynamic Import 语法。</p>
    </>
  );
}
