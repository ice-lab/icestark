/**
 * 首页
 */
import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Splash from '../components/Splash';
import Feature from '../components/Feature';
import Users from '../components/Users';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}-${siteConfig.tagline}`} description="面向大型系统的微前端解决方案">
      <Splash />
      <main>
        <Feature />
        <Users />
      </main>
    </Layout>
  );
}
