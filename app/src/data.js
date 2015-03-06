/**
 * Created by yarden on 2/6/15.
 */
define(function(require) {

  var d3 = require('d3');
  var queue = require('d3_queue');
  var Radio = require('radio');

  var N_GROUPS = 16, N_ROWS = 6, N_COLS = 16, N_PORTS = 40;

  function portId(g, r, c, p) { return ((g*N_ROWS + r)*N_COLS + c)*N_PORTS + p;}
  function Run() {
    this.groups = [];
    this.routers = [];
    this.blues = new Map();
    this.counters = [];
  }

  Run.prototype.routerId= function(r, c) {
    return r*16 + c;
  };

  return function () {

    function init(run) {
      var g, r, c, node, rid = 0, cid = 0;

      for (g = 0; g < N_GROUPS; g++) {
        if (g == 12) continue;

        var group = {id: g, routers: [], connectors: [], open: true};
        run.groups[g] = group;

        for (r = 0; r < N_ROWS; r++) {
          var row = [];
          group.routers.push(row);
          for (c = 0; c < N_COLS; c++) {
            var router = {id: rid++, r: r, c: c, port: new Array(40)};
            row.push(router);
            run.routers.push(router);
          }
        }

        for (c=0; c<N_COLS; c++) {
          group.connectors.push({id: cid++});
        }
      }
    }

    function processConnectivity(data, run) {
      data.forEach(function (d) {
        d.sg = +d.sg;
        d.sr = +d.sr;
        d.sc = +d.sc;
        d.sp = +d.sp;
        d.dg = +d.dg;
        d.dr = +d.dr;
        d.dc = +d.dc;
        d.dp = +d.dp;
        d.values = [0, 0];
        run.blues.set()
      });
    }

    function processNetCounters(data, run) {
      var i, n, counters, values, g, r, c, p, j, nc;

      var rows = d3.csv.parseRows(data);
      for (i=0; i<4; i++) {
        rows[0].shift();
      }
      run.counters = {header: rows[0], data:[]};

      counters = [];
      n=rows.length;
      for (i=1; i<n; i++) {
        values = rows[i];
        g = +values.shift();
        r = +values.shift();
        c = +values.shift();
        p = +values.shift();
        nc = values.length;
        for (j=0; j<nc; j++) {
          values[j] = +values[j];
        }
        var counter = {id: {g: g, r: r, c:c, p:p}, values:values};
        counters.push(counter);
      }

      run.counters.data = counters;
    }

    var service = function() {};


    service.start = function() {
      queue()
        .defer(d3.csv, 'data/blues.csv')
        .defer(d3.text, 'data/vis_net.csv')
        .await(function(error, connectivity, netCounters) {
          if (error) {
            console.log("Error loading data", error);
          }
          else {
            var run = new Run();
            init(run);
            processConnectivity(connectivity, run);
            processNetCounters(netCounters, run);
            Backbone.Radio.channel('data').trigger('change', run);
          }
        });
    };

    return service;
  }

});