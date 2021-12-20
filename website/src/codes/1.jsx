import React from 'react';
import CodeSnippet from './CodeSnippet'

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
      <p>问题可能由多个因素导致，您可以按照下面的提示进行排查：</p>

      <h3>1. 微应用打包成 UMD 应用</h3>
      <p>UMD 模块规范的微应用请参考 <a href='/docs/guide/use-child/react'>React 微应用接入</a>。构建正确的代码应该是类似下面的样子（以 webpack 构建的入口文件结果为例）：</p>

      <CodeSnippet>
          {
            `
            (function webpackUniversalModuleDefinition(root, factory) {
              if(typeof exports === 'object' && typeof module === 'object')
                module.exports = factory();
              else if(typeof define === 'function' && define.amd)
                define([], factory);
              else if(typeof exports === 'object')
                exports["libraryName"] = factory();
              else
                root["libraryName"] = factory();
            })(this, function() {
              ...
            });
            `
          }
        </CodeSnippet>

       <p>亦可将打包的代码拷贝至<a href='https://developer.chrome.com/docs/devtools/javascript/'>谷歌浏览器的 Console 面板</a>执行：</p>

       <img src="https://gw.alicdn.com/imgextra/i1/O1CN01CTbo141PLR9bjI593_!!6000000001824-0-tps-1699-742.jpg" alt="umd 资源执行的结果" />

       <p>亦可简单认为构建产物是没有问题的（您的 <code>@icedesign/stark-child-scaffold</code> 可能需要替换成具体的 <a href='https://webpack.js.org/configuration/output/#outputlibraryname'>webpack libraryName</a>）。</p>

       <p>同时，还需要检查微应用代码中通过 <a href='/docs/api/ice-stark-app/#setlibraryname'>setLibraryName</a> 指定微应用在 window 上挂载的全局变量。icestark 会依据这个变量获取微应用的导出内容（生命周期函数）。</p>

       <p>还有一种可能导致无法获取 UMD 资源的情况是：<bold>异步导出了 <code>mount</code> 和 <code>unmount</code> 函数</bold>。在使用了 <a href="https://module-federation.github.io/">module federation</a> 的应用需要将应用改成异步加载的方式：</p>

       <CodeSnippet>
         {
          `
            // 入口文件
            import './app.ts'; // 生命周期函数定义在 app.ts 当中
          `
         }
       </CodeSnippet>

        <p>这会导致代码执行时，无法默认导出生命周期函数。</p>

       <h3>2. 微应用打包成 ESM 应用</h3>

       <p>ESM 模块规范的微应用请参考 <a href='/docs/guide/use-child/react'>React 微应用接入</a>。构建正确的代码应该是类似下面的样子（以 Vite 构建的入口文件结果为例）：</p>

       <CodeSnippet>
         {
          `
            import { a as axios, j as jsxRuntime, _ as _react_17_0_2_react, xxx } from "./vendor.js";
            const mount = async (props) => {
             // ...
            };
            const unmount = async ({
              container: container2,
              customProps
            }) => {
              // ...
            };
            export { bootstrap, mount, unmount };
          `
         }
       </CodeSnippet>

       <h3>3. 微应用打包成常规应用</h3>

       目前我们并不建议通过 <a src="/docs/guide/concept/child#1-registerappenterregisterappleave">registerAppEnter</a> 的方式接入。
    </>
  );
}
