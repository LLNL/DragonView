/**
 * Created by yarden on 7/24/16.
 */

var sqlite = require('sqlite3');

var DB_FILE = process.env.DragonView_DB || '../data/db.sqlite';

var db = new sqlite.Database(DB_FILE);


function machine(req, res, next) {
  db.all('select * from machine', function (err, rows) {
    if (err) return next(err);

    var machine = {};
    rows.forEach(function (row) {
      machine[row.attr ]= row.value;
    });
    res.send(JSON.stringify(machine));
  });
}

function links(req, res, next) {
  db.all('select * from links', function (err, rows) {
    if (err) return next(err);
    res.send(JSON.stringify(rows));
  });
}

function names(req, res, next) {
  db.all('select name from counters_names', function(err, rows) {
    if (err) return next(err);
    res.send(JSON.stringify(rows.map( function (row) { return row.name;})));
  });
}


function runs(req, res, next) {
  var query = 'select * from runs';
  db.all(query, function(err, rows) {
    if (err) next(err);
    res.send(JSON.stringify(rows));
  });
}

function counter(req, res, next) {
  var t = +Date.now();
  // todo: security hole ${req.body.counter}
  var stmt = db.prepare(`select link_id, ${req.body.counter} from counters where run_id = ? and timestep = ?`);
  stmt.all(req.body.run, req.body.timestep, function(err, rows) {
    var t1 = +Date.now();
    if (err) next(err);
    else {
      res.send(JSON.stringify(rows));
      var t2 = +Date.now();
      console.log(t1-t, t2-t);
    }
  });
}

exports.machine = machine;
exports.links = links;
exports.names = names;
exports.runs = runs;
exports.counter = counter;