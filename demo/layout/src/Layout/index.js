/* eslint no-undef:0, no-unused-expressions:0, array-callback-return:0 */
import React, { Component } from 'react';
import Layout from '@icedesign/layout';
import { enquire } from 'enquire-js';

import Header from './components/Header';
import Aside from './components/Aside';
import Footer from './components/Footer';
import NotFound from '../components/NotFound';
import { AppRouter, AppRoute } from '../../../../lib/index';

import './index.scss';

export default class BasicLayout extends Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      isScreen: undefined,
      pathname: undefined,
      query: undefined
    };
  }

  componentDidMount() {
    this.enquireScreenRegister();
  }

  /**
   * Register the monitor screen changes, according to different resolutions to do the corresponding processing
   */
  enquireScreenRegister = () => {
    const isMobile = 'screen and (max-width: 720px)';
    const isTablet = 'screen and (min-width: 721px) and (max-width: 1199px)';
    const isDesktop = 'screen and (min-width: 1200px)';

    enquire.register(isMobile, this.enquireScreenHandle('isMobile'));
    enquire.register(isTablet, this.enquireScreenHandle('isTablet'));
    enquire.register(isDesktop, this.enquireScreenHandle('isDesktop'));
  };

  enquireScreenHandle = type => {
    const handler = {
      match: () => {
        this.setState({
          isScreen: type
        });
      }
    };

    return handler;
  };

  onRouteChange = (pathname, query) => {
    this.setState({
      pathname,
      query
    });
  };

  render() {
    const { pathname } = this.state;
    const isMobile = this.state.isScreen !== 'isDesktop';
    const layoutClassName = `ice-design-layout-dark ice-design-layout`;

    return (
      <div className={layoutClassName}>
        <Layout>
          <Header isMobile={isMobile} />
          <Layout.Section scrollable>
            <Layout.Aside width="auto" type={null}>
              <Aside isMobile={isMobile} pathname={pathname} />
            </Layout.Aside>
            <Layout.Main>
              <div className="bg">{'Layout内容 .bg { background: #2077ff; }'}</div>
              <AppRouter
                NotFoundComponent={NotFound}
                onRouteChange={this.onRouteChange}
                useShadow
              >
                {/* <AppRoute
                  path={['/', '/index']}
                  title="主页"
                  exact
                  url={[
                    '//c.alicdn.com/nrails/nrails-vendors/0.0.18/index.js',
                    '//c-assets.alibaba-inc.com/nrails/taobaotest/daily_1207/index/common.js',
                    '//c-assets.alibaba-inc.com/nrails/taobaotest/daily_1207/index/index.js',
                    '//c-assets.alibaba-inc.com/nrails/taobaotest/daily_1207/index/index.css',
                    '//c-assets.alibaba-inc.com/nrails/taobaotest/daily_1207/index/common.css'
                  ]}
                /> */}
                <AppRoute
                  path={['/', '/home', '/about', '/index']}
                  exact
                  title="主页"
                  url={['//127.0.0.1:4444/js/index.js', '//127.0.0.1:4444/css/index.css']}
                />
                <AppRoute
                  path="/user"
                  title="用户页面"
                  url={['//127.0.0.1:5555/js/index.js', '//127.0.0.1:5555/css/index.css']}
                />
              </AppRouter>
            </Layout.Main>
          </Layout.Section>
          <Footer />
        </Layout>
      </div>
    );
  }
}
