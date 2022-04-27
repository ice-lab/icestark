import React from 'react';
import CodeSnippet from './CodeSnippet'

export default function Error6({ args }) {
  return (
    <>
      <h1>#6: The stylesheets loaded error：{args[0]}</h1>
      <p>
        icestark <bold>默认使用</bold> <a href="/docs/api/ice-stark#loadscriptmode">loadScriptMode</a> 为 <code>script</code> 加载微应用资源，
        也就是说，icestark 会默认通过 <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link'>Link 元素</a> 将微应用的样式资源插入到 <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head">Head 元素</a>当中。
      </p>
      <p>错误表达的含义是：<b>样式资源 {args[0]} 加载失败了</b>。</p>
      <br />
      <h2>解决办法</h2>
      <p>问题可能由多个因素导致，您可以按照下面的提示进行排查</p>

      <ul>
        <li>可能是由于 <a href='https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'> 跨域问题 </a>导致的。</li>
        当跨域错误发生，控制台通常有明显的跨域报错信息。如果您在本地开发的时候遇到这个问题，通常需要配置本地资源服务器。比如使用 webpack 构建应用的时，需要修改
        <a href="https://webpack.js.org/configuration/dev-server/#root">webpack.devServer</a> 的<a href="https://stackoverflow.com/questions/31602697/webpack-dev-server-cors-issue">配置</a>。
        <br />
        <br />
        <CodeSnippet>
          {
            `
            devServer: {
              ...
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
              }
            }
            `
          }

        </CodeSnippet>

        <li>访问了错误的资源地址</li>
        若资源地址不正确，可会导致资源加载失败。您可以通过谷歌浏览器的 <a href='https://developer.chrome.com/docs/devtools/network/'>开发者工具的 Network 面板</a> 插件资源的加载情况。

        <br />
        <br />
        <img src="https://gw.alicdn.com/imgextra/i4/O1CN01P1Yzfa26XMwwuV9qt_!!6000000007671-0-tps-3576-1060.jpg" alt="使用 Network 面板查看加载情况" />
      </ul>
    </>
  );
}
