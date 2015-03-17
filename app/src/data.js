/**
 * Created by yarden on 2/6/15.
 */
define(function(require) {

  console.log('data 1');
  var model = require('model');
  var d3 = require('d3');
  var queue = require('d3_queue');
  var Radio = require('radio');

  function Run() {
    this.groups = [];
    this.routers = {};
    this.nodes = {};
    this.counters = [];
    this.blues = new Map();
    this.links = new Map();
  }

  Run.prototype.routerId= function(r, c) {
    return r*16 + c;
  };

  return function () {

    console.log('data in return function');

    function init(run) {
      var g, r, c, node, rid = 0, cid = 0;

      for (g = 0; g < model.N_GROUPS; g++) {
        if (g == 12) continue;

        var group = {id: g, routers: [], mode: 'full'};
        run.groups.push(group);

        for (r = 0; r < model.N_ROWS; r++) {
          var row = [];
          group.routers.push(row);
          for (c = 0; c < model.N_COLS; c++) {
            var router = {id: model.router_id(g, r, c), r: r, c: c, port: new Array(40)};
            row.push(router);
            run.routers[router.id] = router;
          }
        }
      }
    }

    function processConnectivity(data, run) {
      data.forEach(function (d) {
        var link = {
          id: model.port_id(+d.sg, +d.sr, +d.sc, +d.sp),
          color: d.color,
          src: {g: +d.sg, r: +d.sr, c: +d.sc, p: +d.sp},
          dest: {g: +d.dg, r: +d.dr, c: +d.dc, p: +d.dp}
        };
        if (d.color == 'b') run.blues.set(link.id, link);
        run.links.set(link.id, link);
      });
    }

    function processNetCounters(data, run) {
      var i, n, counters, values, g, r, c, p, j, nc, link;

      var rows = d3.csv.parseRows(data);
      for (i = 0; i < 4; i++) {
        rows[0].shift();
      }
      run.countersNames = rows[0];
      run.counters = [];
      n = rows.length;
      for (i = 1; i < n; i++) {
        values = rows[i];
        g = +values.shift();
        r = +values.shift();
        c = +values.shift();
        p = +values.shift();
        nc = values.length;
        for (j = 0; j < nc; j++) {
          values[j] = +values[j];
        }
        var id = model.port_id(g, r, c, p);
        //var link = run.blues.get(id);
        //if (link) link.counters = values;

        link = run.links.get(id);
        if (link)
          link.counters = values;
        else {
          if (values.some(function (v) {
              return v > 0;
            }))  console.log('missing link:', g, r, c, p);
        }

        //run.counters.push({ id:model.router_id(g, r, c), key: {g:g, r:r, c:c, p: p}, values:values});
      }
    }

    function loadJobs(data, run) {
      data.forEach(function (node) {
        node.id = model.node_id(node);
        run.nodes.set(node.id, node);
      });
    }

    function loadCounters(data, run) {
      var i, n, values, sg, sr, sc, dg, dr, dc, color, j, nc, id, link;

      var rows = d3.csv.parseRows(data);
      run.countersNames = rows[0].slice(7);
      run.counters = [];
      n = rows.length;
      for (i = 1; i < n; i++) {
        values = rows[i];
        sg = +values.shift();
        sr = +values.shift();
        sc = +values.shift();
        dg = +values.shift();
        dr = +values.shift();
        dc = +values.shift();
        color = values.shift();
        nc = values.length;
        for (j = 0; j < nc; j++) {
          values[j] = +values[j];
        }
        id = model.link_id(sg, sr, sc, dg, dr, dc);
        link = {
          id: id,
          color: color,
          src: {g: sg, r: sr, c: sc},
          dest: {g: dg, r: dr, c: dc},
          counters: values
        };
        if (d.color == 'b') run.blues.set(link.id, link);
        run.links.set(link.id, link);
        link = run.links.set(id, link);
      }
    }

    var service = function () {
      console.log('dat service');
    };


    service.start1 = function () {
      queue()
        .defer(d3.csv, 'data/topology.csv')
        .defer(d3.text, 'data/vis_net.csv')
        .await(function (error, connectivity, netCounters) {
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

    service.start = function () {
      queue()
        .defer(d3.csv, 'data/jobs.csv')
        .defer(d3.text, 'data/net_counters.csv')
        .await(function (error, jobs, counters) {
          if (error) {
            console.log("Error loading data", error);
          }
          else {
            var run = new Run();
            init(run);
            loadJobs(jobs, run);
            loadCounters(counters, run);
            Backbone.Radio.channel('data').trigger('change', run);
          }
        });

      return service;
    }
  }

});