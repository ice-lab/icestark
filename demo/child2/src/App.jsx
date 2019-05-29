import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { renderNotFound, getBasename } from '../../../lib/index';

import UserHomePage from './pages/UserHome';
import UserEditPage from './pages/UserEdit';

import './App.scss';

export default class App extends React.Component {
  render() {
    return (
      <Router basename={getBasename()}>
        <Switch>
          <Route exact path="/" component={UserHomePage} />
          <Route path="/home" component={UserHomePage} />
          <Route path="/edit" component={UserEditPage} />
          <Route
            component={() => {
              return renderNotFound();
            }}
          />
        </Switch>
      </Router>
    );
  }
}
