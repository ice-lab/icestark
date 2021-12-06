import React from 'react';

export default function Error1({ args }) {
  return (
    <>
      <h1>#1: Unable to retrieve lifecycles of {args[0]} after loading it</h1>
      <p>
        在 icestark 中，微应用需要导出 <a href="/docs/guide/concept/child#生命周期">生命周期函数</a>。根据 <a href="/docs/api/ice-stark#loadscriptmode">loadScriptMode</a> 的不同设置，icestark 会采取不同的方式来获取到微应用导出的生命周期函数。
      </p>
      <p>这个错误表达的含义是：<b>icestark 无法正确获取到生命周期函数</b>。</p>
      <br />
      <h2>解决办法</h2>
      <p>问题可能由多个因素导致，您可以按照下面的途径进行排查</p>

      <ul>
        <li>未按照 <a href="/docs/guide/use-child/react">微应用接入</a> 正确改造微应用</li>
        <li>微应用在加载的时候产生错误 - 当应用在加载的过程中就已经发生错误了，那么就无法正确注册生命周期函数。这时候，需要修复微应用加载过程中的错误。</li>
      </ul>
    </>
  );
}
