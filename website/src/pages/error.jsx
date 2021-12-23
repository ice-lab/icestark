/**
 * 首页
 */
import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import AreaWrapper from '../components/AreaWrapper';

const codes = require.context('../codes', false, /\.jsx$/);
const URLSearchParams = typeof window !== 'undefined' ? window.URLSearchParams : require('url').URLSearchParams;

export default function Error(props) {
  const searchs = new URLSearchParams(props.location.search);
  const errCode = searchs.get('code');
  const { siteConfig } = useDocusaurusContext();
  const searchsValues = [...searchs.values()].filter((c) => errCode !== c);

  if (!errCode) {
    return (
      <Layout title={`${siteConfig.title}-${siteConfig.tagline}`} description="面向大型系统的微前端解决方案">
        <AreaWrapper style={{ minHeight: '200px' }} >无法解析当前错误码。</AreaWrapper>
      </Layout>
    );
  }

  if (!codes.keys().includes(`./${errCode}.jsx`)) {
    return (
      <Layout title={`${siteConfig.title}-${siteConfig.tagline}`} description="面向大型系统的微前端解决方案">
        <AreaWrapper style={{ minHeight: '200px' }} >没有找到与当前错误码 {errCode} 对应的解释页面。</AreaWrapper>
      </Layout>
    );
  }

  const ErrComponent = codes(`./${errCode}.jsx`).default;

  return (
    <Layout title={`${siteConfig.title}-${siteConfig.tagline}`} description="面向大型系统的微前端解决方案" >
      <AreaWrapper style={{ minHeight: 'auto' }}>
        <ErrComponent args={searchsValues} />
      </AreaWrapper>
    </Layout>
  );
}

