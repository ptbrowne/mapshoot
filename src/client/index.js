const { render }  = require('react-dom');
const { Router, hashHistory }  = require('react-router');
const routes      = require('../shared/routes');

render(
  <Router children={routes} history={hashHistory} />,
  document.getElementById('react-view')
);
