const { render }  = require('react-dom');
const { Router, hashHistory }  = require('react-router');
const routes      = require('../shared/routes');

const node = document.getElementById('react-view');
render(
  <Router children={routes} history={hashHistory} />,
  node
);
