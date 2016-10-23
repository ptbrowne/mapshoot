var React       = require('react');
var { render }  = require('react-dom');
var { Router, hashHistory }  = require('react-router');
var routes      = require('../shared/routes');

render(
  <Router children={routes} history={hashHistory} />,
  document.getElementById('react-view')
);
