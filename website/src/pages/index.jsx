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
    <Layout title={`${siteConfig.title}-${siteConfig.tagline}`} description="基于 React 的渐进式研发框架">
      <Splash />
      <main>
        <Feature />
        <Users />
      </main>
    </Layout>
  );
}
