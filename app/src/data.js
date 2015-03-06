/**
 * Created by yarden on 2/6/15.
 */
define(function(require) {

  var d3 = require('d3');
  var queue = require('d3_queue');
  var Radio = require('radio');

  var N_GROUPS = 16, N_ROWS = 6, N_COLS = 16;

  function Run() {
    this.groups = [];
    this.routers = [];
    this.blues = [];
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
        d.value = 0;
        run.blues.push(d);
      });
    }

    function processNetCounters(data, run) {
      var rows = d3.csv.parseRows(data);
      var i, n, counters, g, r, c, p, j, nc;

      run.countersName = rows[0];
      run.countersValues = rows;
      run.countersValues.shift();

      for (i=0; i<4; i++) {
        run.countersName.shift();
      }

      n=rows.length;
      for (i=0; i<n; i++) {
        counters = rows[i];
        g = +counters.shift();
        r = +counters.shift();
        c = +counters.shift();
        p = +counters.shift();
        nc = counters.length;
        for (j=0; j<nc; j++) {
          counters[j] = +counters[j];
        }
        run.groups[g].routers[r][c].port[p] = counters;
      }
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