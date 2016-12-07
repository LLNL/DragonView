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
    //this.nodes = new Map();
    this.counters = [];
    this.blues = [];
    this.greens = [];
    this.blacks = [];
    this.links = new Map();
    this.jobs = d3.map();
    this.jobsColor = [];
    this.core_to_node = d3.map();



    // for(g = 0; g < model.N_GROUPS; g++) {
    //
    // }
  }

  Run.prototype.createGroup = function(g) {
    var r, c, node, rid = 0, cid = 0;
    var group = {id: g, routers: [], mode: 'full'};

    this.groups[g] = group;
    for(r = 0; r < model.N_ROWS; r++) {
      var row = [];
      group.routers.push(row);
      for(c = 0; c < model.N_COLS; c++) {
        var router = {
          id: model.router_id(g, r, c),
          g: g,  r:r,  c:c,
          jobs:[],
          nodes_jobs: [undefined, undefined, undefined, undefined],
          nodes_color: [undefined, undefined, undefined, undefined],
          color: config.UNKNOWN_JOB_COLOR,
          green: 0,
          black: 0
        };
        row.push(router);
        this.routers.set(router.id, router);
      }
    }
  };

  Run.prototype.updateJobColor = function(job, color) {
    this.jobsColor[job.idx] = color;
    this.routers.values().forEach(function (router) {
      if (router.jobs.length == 1 && router.jobs[0] == job)
        router.color = color;
    });
  };

  function loadRun(channel, name) {
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
          loadPlacement(placement, run);
          loadCounters(counters, run);
          Backbone.Radio.channel(channel).trigger('data.run', run);
        }
      });
  }

  function loadPlacement(data, run) {
    var job, router, idx=0, n, i;

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

        // TEMP: ignore data outside of config params
        if (item.g >= model.N_GROUPS || item.r >= model.N_ROWS || item.c >= model.N_COLS || item.n >= model.N_NODES) return;

        job = run.jobs.get(item.jobid);
        if (!job) {
          job = {id: item.jobid, idx: idx, n:0};
          run.jobs.set(item.jobid, job);
          idx++;
        }
        job.n++;

        var router_id = model.router_id(item);
        router = run.routers.get(router_id);
        if (!router) {
          run.createGroup(item.g);
          router = run.routers.get(router_id);
        }
        if (router.jobs.indexOf(job) == -1) {
          router.jobs.push(job);
          //router.color = router.jobs.length == 1 ? job.color : config.MULTI_JOBS_COLOR;
        }
        if (!router.nodes_jobs[item.n]) router.nodes_jobs[item.n] = new Set([job]);
        else router.nodes_jobs[item.n].add(job);
      }
    });

    var jobs = run.jobs.values();
    jobs.sort(function (a,b) { return b.n - a.n;});
    for (i=0, n=jobs.length; i<n; i++) {
      jobs[i].color = config.jobColor(i);
      jobs[i].idx = i;
    }
    run.routers.forEach(function(key, router) {
      if (router.jobs.length == 1) {
        router.job_color = router.jobs[0].color;
        router.idx = router.jobs[0].idx;
      } else {
        router.job_color = config.MULTI_JOBS_COLOR;
        router.idx = config.JOBS_COLORMAP.length;
      }
      for (i=0; i<4; i++) {
        if (router.nodes_jobs[i])
          router.nodes_color[i] = router.nodes_jobs[i].size > 1 ? config.MULTI_JOBS_COLOR : router.nodes_jobs[i].values().next().value.color;
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

      // TEMP: ignore data outside of config parameters
      if (sg >= model.N_GROUPS || sr >= model.N_ROWS || sc >= model.N_COLS || dg >= model.N_GROUPS || dr >= model.N_ROWS || dc >= model.N_COLS) continue;

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

  service.loadCatalog = function (channel, file) {
    d3.csv(file, function(list) {
      list.forEach(function(item) {
        item.counters = '/data/'+item.counters;
        item.jobs = '/data/'+item.jobs;
        item.comm = item.comm && '/data/'+item.comm;
      });
      runsInfo = d3.map(list,  function(d) { return d.name;});
      Backbone.Radio.channel(channel).trigger('data.runsList', list);
    });
    return this;
  };

  service.createCatalog = function(channel, sims) {
    var keys, s;
    var re = /(\w+)\-/;
    var list = sims.map(function(sim) {
      var keys = sim.split(',');
      var s = re.exec(keys[1])[1];
      return {
        name:     sim,
        counters: '/data/links/linkdata/' + keys[0] + '/' + keys[1] + '/' + keys[2] + '/links-' + s + '.csv',
        jobs:     '/data/links/placements/' + keys[1] + '/'  + s + '.csv',
        comm:     undefined
      };
    });
    runsInfo = d3.map(list,  function(d) { return d.name;});
    Backbone.Radio.channel(channel).trigger('data.runsList', list);
  };

  service.load = function (channel, name) {
    var run = runs.get(name);
    if (!run) {
      loadRun(channel, name);
    } else {
      Backbone.Radio.channel(channel).trigger('data.run', run);
    }
    return this;
  };

  return service;
});