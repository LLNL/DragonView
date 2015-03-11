/**
 * Created by yarden on 2/6/15.
 */
define(function(require) {

  var d3 = require('d3');
  var queue = require('d3_queue');
  var Radio = require('radio');

  var N_ROWS = 6, N_COLS = 16, N_PORTS = 40;

  var blues;

  function Run(data) {
    var i,n;
    var rows = d3.csv.parseRows(data);

    this.header = rows[0];
    for (i=0; i<4; i++) this.header.shift();

    rows.shift();
    this.counters = rows;

    this.root = {id: '', children: new Array(16)}
    n = rows.length;
    for (i=0; i<n; i++) {


    }

  }

  function loadBlues(callback) {
    d3.csv('data/blues.csv')
      .row(function(d) { return { src: {g: +d.sg, r: +d.sr, c: +d.sc, p: +d.sp},
                                  dest:{g: +d.dg, r: +d.dr, c: +d.dc, p: +d.dp}}; })
      .get(function(error, rows) {
        blues = rows;
        callback(error, rows);
      });
  }


  var service = {};

  service.load = function() {
    queue()
      .defer(loadBlues)
      .defer(d3.text, 'data/vis_net.csv')
      .await(function(error, connectivity, netCounters) {
        if (error) {
          console.log("Error loading data", error);
        }
        else {
          var run = new Run(netCounters);
          Backbone.Radio.channel('data').trigger('change', run);
        }
      });
  };

  service.blues = function() {
    return blues;
  };

  return service;
});