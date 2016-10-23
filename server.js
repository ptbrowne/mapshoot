var express = require('express');

var express                   = require('express');
var React                     = require('react');
var { renderToString }        = require('react-dom/server');
var { RouterContext, match } = require('react-router');
var createLocation            = require('history/lib/createLocation');
var routes                    = require('./src/shared/routes');
var http = require('http');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var app = express();

app.use('/e.gpx', (req, res) => {
  http.get("http://casajac.org/e.gpx", function (response) {
    response.pipe(res);
  });
});

_.each(['pin-icon-start.png', 'pin-icon-end.png', 'pin-shadow.png'], function (icon) {
  app.use('/' + icon, (req, res) => {
    var filepath = path.resolve('src/client/', icon);
    fs.createReadStream(filepath).pipe(res);
  });
});

app.use((req, res) => {
  const location = createLocation(req.url);
  match({ routes, location }, (err, redirectLocation, renderProps) => {
    if (err) {
      console.error(err);
      return res.status(500).end('Internal server error');
    }
    if (!renderProps) return res.status(404).end('Not found.');

    const InitialComponent = (
      <RouterContext {...renderProps} />
    );
    const componentHTML = renderToString(InitialComponent);
    const HTML = fs
      .readFileSync(path.resolve(__dirname, 'src/shared/index.html')) + ''
      .replace('${componentHTML}', componentHTML);

    res.end(HTML);
  });
});

module.exports = app;