var React       = require('react');
var { render }  = require('react-dom');
var { Router, browserHistory }  = require('react-router');
var routes      = require('../shared/routes');

render(
  <Router children={routes} history={browserHistory} />,
  document.getElementById('react-view')
);
