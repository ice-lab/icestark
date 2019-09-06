import React from 'react';
import { AppRouter, AppRoute } from '@ice/stark';
import CommonHeader from './commonHeader';
import './App.css';

class App extends React.Component {
  onRouteChange = (pathname: string, query: object) => {
    console.log(pathname, query);
  }

  render() {
    return (
      <div>
        <CommonHeader />
        <AppRouter
          onRouteChange={this.onRouteChange}
          ErrorComponent={<div>js bundle loaded error</div>}
          NotFoundComponent={<div>NotFound</div>}
        >
          <AppRoute
            path={['/', '/list', '/detail']}
            basename="/"
            exact
            title="商家平台"
            url={[
              '//g.alicdn.com/icestark-demo/child/0.2.1/js/index.js',
              '//g.alicdn.com/icestark-demo/child/0.2.1/css/index.css',
            ]}
          />
          <AppRoute
            path="/waiter"
            basename="/waiter"
            title="小二平台"
            url={[
              '//g.alicdn.com/icestark-demo/child2/0.2.1/js/index.js',
              '//g.alicdn.com/icestark-demo/child2/0.2.1/css/index.css',
            ]}
          />
        </AppRouter>
      </div>
    );
  }
}

export default App;
