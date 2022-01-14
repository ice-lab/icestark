import React from 'react';

export default function Error1({ args }) {
  return (
    <>
      <h1>#3: window.fetch not found, you need to polyfill it!</h1>
      <p>
        若配置微应用的加载方式 <a href="/docs/api/ice-stark#loadscriptmode">loadScriptMode</a> 为 <code>fetch</code> 时，icestark 会默认使用浏览器原生的 <a href='https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'>fetch API</a> 来加载脚本和样式资源。
      </p>
      <p>这个错误表达的含义是：<b>浏览器不支持原生 fetch API</b>。</p>
      <br />
      <h2>解决办法</h2>
      <p>1. 为不支持的 fetch API 的浏览器（比如 <a href="https://caniuse.com/?search=fetch">IE 浏览器</a>）添加 <a href='/docs/faq#%E5%85%BC%E5%AE%B9-ie-%E6%B5%8F%E8%A7%88%E5%99%A8'>polyfill</a>。</p>
      <p>2. 使用 <a href='/docs/api/ice-stark#fetch'>自定义 fetch 能力</a> 修改为更为通用的 <a href='https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest'>XMLHttpRequest</a> 请求方式，比如使用社区
        的 <a href='https://github.com/axios/axios'>Axios</a> 包。
      </p>
    </>
  );
}
