import React from 'react';

export default function Error7({ args }) {
  return (
    <>
      <h1>#7: Each item of activePath must be string、object、array or a function.</h1>

      <p>警告表达的含义是：activePath 接收的参数错误，应该是字符串、对象，数组或函数类型。</p>
      <br />
      <h2>解决办法</h2>

      <p> activePath 接受到的参数可能是 undefind、null 或者空字符。详见 activePath 可配置的 <a href="/docs/api/ice-stark#activePath">参数</a> </p>
    </>
  );
}
