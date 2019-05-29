import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { renderNotFound, getBasename } from '../../../lib/index';

import HomePage from './pages/Home';
import AboutPage from './pages/About';

import './App.scss';

export default class App extends React.Component {
  render() {
    return (
      <Router basename={getBasename()}>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/home" component={HomePage} />
          <Route path="/about" component={AboutPage} />
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
