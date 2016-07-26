/**
 * Created by yarden on 7/9/15.
 */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var db = require('./ldav');


var app = express();

var app_dir = path.join(__dirname, '../app');

app.set('port', process.env.PORT || 4100);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(logErrors);

app.use(express.static(app_dir));
app.use(express.static(app_dir+'/lib'));
//app.use(express.static(app_dir+'/src'));

app.get(function(req, res) {
  console.log('called');
});

app.get('/info/machine', db.machine);
app.get('/info/links', db.links);
app.get('/info/names', db.names);
app.get('/info/runs', db.runs);
app.post('/data/counter', db.counter);



app.use(function(err, req, res, next) {
  console.error(err.stack);
  next(err);
});

app.listen(app.get('port'), function() {
  console.log('DragonView server listening on port '+app.get('port'));
});

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}


