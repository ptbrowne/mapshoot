const { render }  = require('react-dom');
const { Router, browserHistory }  = require('react-router');
const routes      = require('../shared/routes');

render(
  <Router children={routes} history={browserHistory} />,
  document.getElementById('react-view')
);
