import React from 'react';

export default function Error1({ args }) {
  return (
    <>
      <h1>#4: Can not find app {args[0]} when call {args[1]}.</h1>
      <p>这个错误表达的含义是：<b>在执行函数 {args[1]} 时，无法获取微应用 {args[0]} 的配置</b>。</p>
      <br />
      <h2>解决办法</h2>
      <p>在调用 {args[1]} 函数前，请确保通过 <a href='/docs/api/ice-stark#registermicroapps-'>registerMicroApps</a> 和 <a href='/docs/api/ice-stark#createmicroapp-'>createMicroApp</a> 注册了微应用。</p>
    </>
  );
}
