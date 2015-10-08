/**
 * Created by yarden on 2/6/15.
 */
define(function(require) {

  var model = require('model');
  var d3 = require('d3');
  var queue = require('d3_queue');
  var Radio = require('radio');
  var config = require('config');


  var runsInfo;
  var runs = d3.map();


  function Run(name) {
    this.groups = [];
    this.routers = d3.map();
    this.routers = d3.map();
    //this.nodes = new Map();
    this.counters = [];
    this.blues = [];
    this.greens = [];
    this.blacks = [];
    this.links = new Map();
    this.jobs = d3.map();
    this.jobsColor = [];
    this.core_to_node = d3.map();

    var g, r, c, node, rid = 0, cid = 0;

    for(g = 0; g < model.N_GROUPS; g++) {
      var group = {id: g, routers: [], mode: 'full'};
      this.groups.push(group);
      for(r = 0; r < model.N_ROWS; r++) {
        var row = [];
        group.routers.push(row);
        for(c = 0; c < model.N_COLS; c++) {
          var router = {
            id: model.router_id(g, r, c),
            g: g,  r:r,  c:c,
            jobs:[],
            color: config.UNKNOWN_JOB_COLOR
          };
          row.push(router);
          this.routers.set(router.id, router);
        }
      }
    }
  }

  Run.prototype.updateJobColor = function(job, color) {
    //var prev = this.jobsColor[idx];
    this.jobsColor[job.idx] = color;
    this.routers.values().forEach(function (router) {
      if (router.jobs.length == 1 && router.jobs[0] == job)
        router.color = color;
    });
  };

  function loadRun(name) {
    var info = runsInfo.get(name);
    queue()
      .defer(d3.csv, info.jobs)
      .defer(d3.text, info.counters)
      .await(function (error, placement, counters) {
        if (error) {
          console.log("Error loading data", error);
        }
        else {
          var run = new Run(name);
          run.commFile = info.comm;
          //runs.set(name, run);
          loadPlacement(placement, run);
          loadCounters(counters, run);
          Backbone.Radio.channel('data').trigger('run', run);
        }
      });
  }

  function loadPlacement(data, run) {
    var job, router, idx=0, n;
    data.forEach(function (item) {
      if (item.core == undefined || item.core == 0) {
        item.g = +item.g;
        item.r = +item.r;
        item.c = +item.c;
        item.n = +item.n;
        item.id = model.node_id(item);
        item.jobid = +item.jobid;
        if (item.jobid == undefined)
          console.log('undefined jobid for core:',item);

        //run.nodes.set(item.id, item);

        job = run.jobs.get(item.jobid);
        if (!job) {
          job = {id: item.jobid, idx: idx, n:0, color:config.jobColor(idx)};
          run.jobsColor.push(job.color);
          run.jobs.set(item.jobid, job);
          idx++;
        }
        job.n++;

        router = run.routers.get(model.router_id(item));
        if (router.jobs.indexOf(job) == -1) {
          router.jobs.push(job);
          router.color = router.jobs.length == 1 ? job.color : config.MULTI_JOBS_COLOR;
        }
      }
    });
  }

  function loadCounters(data, run) {
    var i, n, idx, base;
    var values, sg, sr, sc, dg, dr, dc, color, j, nc, id, link;

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
      link = run.links.get(id);
      if (!link) {
        link = {
          id:       id,
          color:    color,
          srcId:    {g: sg, r: sr, c: sc},
          destId:   {g: dg, r: dr, c: dc},
          src:      run.routers.get(model.router_id(sg, sr, sc)),
          dest:     run.routers.get(model.router_id(dg, dr, dc)),
          counters: values,
          total: values.concat(),
          n: 1
        };
        run.links.set(link.id, link);
        if (color == 'b') run.blues.push(link);
        else if (color == 'g') run.greens.push(link);
        else run.blacks.push(link);
      } else {
        for (j=0; j<nc; j++) {
          link.counters[j] = Math.max(link.counters[j], values[j]);
          link.total[j] += values[j];
          //if (values[j] == 0) console.log('link:', link);
        }
        link.n++;
      }
    }
  }

  var service = {};

  service.loadCatalog = function (file) {
    d3.csv(file, function(list) {
      //list.sort(function(a,b) {
      //  if (a.name < b.name) return -1;
      //  else if (a.name > b.name) return 1;
      //  return 0;
      //});
      list.forEach(function(item) {
        item.counters = '/data/'+item.counters;
        item.jobs = '/data/'+item.jobs;
        item.comm = item.comm && '/data/'+item.comm;
      });
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