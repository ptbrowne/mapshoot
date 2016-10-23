var React = require('react');
var { Route } = require('react-router');
var App = require('./components/App');

module.exports = (
  <Route name="app" path="/" component={App}>
  </Route>
);