import React from 'react';
import styles from './feature.module.css';
import AreaWrapper from '../AreaWrapper';

const data = [
  {
    title: '框架无关',
    desc: '支持市面上所有的前端框架，比如 React、Vue 、Angular 等构建主应用和微应用',
    // url: '/docs/guide/basic/structure',
  },
  {
    title: '快速迁移',
    desc: '支持 url、entry、html content、甚至 iframe 等多种接入方式，可以快速、低成本地迁移老项目',
    url: '/docs/guide/concept/child#入口规范',
  },
  {
    title: '安全',
    desc: '完备的沙箱能力、CSS Module 样式方案，让微应用更安全地接入',
    url: '/docs/guide/advanced/sandbox#js-污染',
  },
  {
    title: '性能优秀',
    desc: '提供 shouldAssetsRemove、预加载、预执行、ssr 等多种性能优化手段，让您的应用加载起飞',
    url: '/docs/guide/advanced/performance',
  },
  {
    title: '简单易用',
    desc: '提供多种开箱即用的工具和不断改进的报错信息，可以身心愉悦地开发并调试您的微前端应用',
  },
  {
    title: '支持微模块',
    desc: '除了微应用，icestark 还支持微模块，一种没有路由、粒度更小的挂件',
    url: '/docs/guide/micro-module',
  },
];

function Feature() {
  return (
    <AreaWrapper
      title="为什么选择 icestark"
      desc={'开箱即用的研发框架，内置工程配置、状态管理、数据请求、权限管理等最佳实践，让开发者可以更加专注于业务逻辑'}
      contentStyle={styles.container}
      isBlock
      hiddenSubTitle
    >
      {data.map((item, index) => (
        <a key={index} className={styles.card} href={item.url}>
          <div className={styles.content}>
            <h3>{item.title}</h3>
            <span>{item.desc}</span>
            <div style={{ flex: 1 }}></div>
            { item.url && (
              <p>{'Documentation >'}</p>
            ) }
          </div>
        </a>
      ))}
    </AreaWrapper>
  );
}

export default Feature;
