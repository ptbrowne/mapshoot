'use strict';

var piping = require('piping');
require("babel-register")({});

var server = require('./server');

const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
  console.log('Server listening on', PORT);
});