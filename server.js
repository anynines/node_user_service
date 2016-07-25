var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes.js');
app.use('/', routes);

app.listen(3001);
console.log('server started on port 3001');
