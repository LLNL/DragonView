/**
 * Created by yarden on 11/9/15.
 */

define(function(require) {

  var d3 = require('d3');
  var Radio = require('radio');
  var config = require('config');
  var sql = require('sql');

  var db;

  function load() {
    if (db) return;

    d3.xhr('data/cg.sqlite')
      .responseType('arraybuffer')
      .get(function (err, data) {
        if (err) {
          console.log(err);
        } else {
          db = new sql.Database(new Uint8Array(data.response));

          var res = db.exec("select * from detectors");
          console.log('res:', res);
        }
      }
    );
  }

  function render(data) {
    var r, c;
    for (r=0; r<data.rows.)
  }


  var compare = function() {};

  compare.show = function() {

  };

  return compare;

});