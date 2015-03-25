/**
 * Created by yarden on 2/6/15.
 */
define(function(require) {

  var model = require('model');
  var d3 = require('d3');
  var queue = require('d3_queue');
  var Radio = require('radio');

  var runsInfo;
  var runs = d3.map();

  function createRun(name) {
    var run = {
      groups: [],
      routers: {},
      nodes: new Map(),
      counters: [],
      blues: new Map(),
      greens: new Map(),
      blacks: new Map(),
      links: new Map()
      };

    var g, r, c, node, rid = 0, cid = 0;

    for(g = 0; g < model.N_GROUPS; g++) {
      var group = {id: g, routers: [], mode: 'full'};
      run.groups.push(group);
      for(r = 0; r < model.N_ROWS; r++) {
        var row = [];
        group.routers.push(row);
        for(c = 0; c < model.N_COLS; c++) {
          var router = {id: model.router_id(g, r, c), r: r, c: c /*, port: new Array(40)*/};
          row.push(router);
          run.routers[router.id] = router;
        }
      }
    }
    return run;
  }

  function loadRun(name) {
    var info = runsInfo.get(name);
    queue()
      .defer(d3.csv, 'data/'+info.jobs)
      .defer(d3.text, 'data/'+info.counters)
      .await(function (error, jobs, counters) {
        if (error) {
          console.log("Error loading data", error);
        }
        else {
          var run = createRun(name);
          runs.set(name, run);
          loadJobs(jobs, run);
          loadCounters(counters, run);
          Backbone.Radio.channel('data').trigger('run', run);
        }
      });
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
        srcId: {g: sg, r: sr, c: sc},
        src: run.routers[model.router_id(sg, sr, sc)],
        destId: {g: dg, r: dr, c: dc},
        dest: run.routers[model.router_id(dg, dr, dc)],
        counters: values
      };
      if (!link.dest) {
        console.log('link error: ', link);
      }
      if (color == 'b') run.blues.set(link.id, link);
      else if (color == 'g') run.greens.set(link.id, link);
      else run.blacks.set(link.id, link);

      run.links.set(link.id, link);
      link = run.links.set(id, link);
    }
  }

  var service = {};

  service.start = function () {
    d3.csv('data/runs.csv', function(list) {
      runsInfo = d3.map(list,  function(d) { return d.name;});
      Backbone.Radio.channel('data').trigger('runsList', list);
    });
    return this;
  };

  service.load = function (name) {
    var run = runs.get(name);
    if (!run) {
      loadRun(name);
    } else {
      Backbone.Radio.channel('data').trigger('run', run);
    }
    return this;
  };

  return service;
});