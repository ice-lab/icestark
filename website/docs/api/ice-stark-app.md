---
toc: menu
---

# @ice/stark-app

以下 api 均从 `@ice/stark-app` 导出。使用方式如下：

```js
import { isInIcestark } from '@ice/stark-app';
```

对于使用非 React 的用户，我们建议您直接从 `lib` 目录下导入这些方法，比如：

```js
import isInIcestark from '@ice/stark-app/lib/isInIcestark';
```

## isInIcestark

判断当前运行环境，是否运行在 icestark 环境中，返回值类型：boolean

- 类型：`function`
- 示例代码详见 `registerAppLeave`

## getBasename

配置微应用 `React Router` 中的 `basename` 参数的方法，根据 `AppRoute` 中的 `basename` 或者 `activePath` 配置生成最终结果

- 类型：`function`
- 默认值：`() => basename || (Array.isArray(activePath) ? activePath[0] : activePath)) || "/"`

## getMountNode

根据微应用运行环境，返回微应用渲染节点

- 类型：`function`
- 默认值：`<div id="ice-container"></div>`
- 使用规则：方法支持传参，传参代表默认渲染的 DOM 节点，默认节点只在微应用单独启动时生效。支持 `string | HTMLElement | function`， `string` 表示默认 DOM 节点的 `id`，`function` 支持函数返回值作为默认 DOM 节点

## renderNotFound

微应用触发渲染全局 404 的方法

- 类型：`function`

## appHistory

提供手动切换不同应用的方法。

#### appHistory.push

- 类型：`function`
- 代码示例：

```js
import React from 'react';
import { appHistory } from '@ice/stark-app';

export default class SelfLink extends React.Component {
  render() {
    return (
      <span
        onClick={() => {
          appHistory.push('/home');
        }}
      >
        selfLink
      </span>
    );
  }
}
```

#### appHistory.replace

- 类型：`function`
- 代码示例参考 `appHistory.push`

## AppLink

提供声明式的，可访问的导航，表示本次跳转需要重新加载静态资源。微应用内部跳转仍然使用 `Link`

#### to

目标路径，同 `Link` 中的 `to` 保持一致 ，必填

- 类型：`string`
- 默认值：`-`

#### replace

如果为 true，则单击链接将替换历史记录中的当前记录，而不是添加新记录。

- 类型：`boolean`
- 默认值：`false`

#### message

表示当前跳转需要弹窗确认，message 为提示文案内容，选填

- 类型：`string`
- 默认值：`-`

#### hashType

当前跳转以 `hash` 路由形式进行跳转，选填

- 类型：`boolean`
- 默认值：`false`

代码示例：

```js
import React from 'react';
import { Link } from 'react-router-dom';
import { AppLink } from '@ice/stark';

export default class SelfLink extends React.Component {
  // 商家平台代码
  render() {
    return (
      <div>
        <AppLink to="/waiter/list">使用 AppLink 跳转到小二平台的列表页</AppLink>
        <Link to="/detail">跳转到商家平台详情页</Link>
      </div>
    );
  }
}
```

## registerAppEnter

提供快速注册当前应用加载前的回调事件

- 类型：`function`
- 示例代码详见 `registerAppLeave`

## registerAppLeave

提供快速注册当前应用卸载前的回调事件

- 类型：`function`
- 代码示例：

```javascript
// src/index.js
import ReactDOM from 'react-dom';
import { isInIcestark, getMountNode, registerAppEnter, registerAppLeave } from '@ice/stark-app';
import router from './router';

if (isInIcestark()) {
  const mountNode = getMountNode();
  registerAppEnter(() => {
    ReactDOM.render(router(), getMountNode());
  });
  // make sure the unmount event is triggered
  registerAppLeave(() => {
    ReactDOM.unmountComponentAtNode(getMountNode());
  });
} else {
  ReactDOM.render(router(), document.getElementById('ice-container'));
}
```

## setLibraryName

配置微应用导出的 umd 全局变量。

+ 类型： `function`
+ 代码示例：

```js
import ReactDOM from 'react-dom';
import { isInIcestark, setLibraryName } from '@ice/stark-app';
import App from './App';

setLibraryName('microApp');

export function mount(props) {
  const { container, customProps } = props;
  ReactDOM.render(<App {...customProps} />, container);
}

export function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container);
}
```
