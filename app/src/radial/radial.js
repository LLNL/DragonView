/**
 * Created by yarden on 1/30/15.
 */
define(function(require) {

  var d3 = require('d3');
  var Layout = require('radial/layout');
  var model = require('model');

  return function() {
    var WIDTH = 1000, HEIGHT = 1000,
        INNER_RADIUS = 400, GROUP_HEIGHT = 100;
    var MULTI_JOBS_COLOR = '#808080';
    var UNKNOWN_JOB_COLOR = '#ffffff';

    var layout = Layout().size([WIDTH, HEIGHT]),
        opt = layout.parms(),
        svgContainer, svg;

    var range, counterId;
    var data, groups, connectors, connections;
    var d3groups, d3connectors, d3connections;


    var group_arc = d3.svg.arc()
      .innerRadius(opt.innerRadius)
      .outerRadius(opt.outerRadius)
      .cornerRadius(0);

    var bundle = d3.layout.bundle();
    var line = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.2)
      .radius(function(d) { return d.r; })
      .angle(function(d) { return d.angle; });


    function find(key) {
      var ng = data.blueRoutes.children.length;
      for (var i=0; i<ng; i++) {
        if (data.blueRoutes.children[i].id == key.g) {
          var g = data.blueRoutes.children[i];
          var c = g.children[key.c];
          return c.children[key.r];
        }
      }
      return undefined;
    }


    function filter() {
      var routers = new Map();
      filterBlues(routers);
      filterGreens(routers);
      filterBlacks(routers);

      renderRouters(routers);
    }

    function filterBlues(routers) {
      var links = [], value;

      data.blues.forEach(function(link) {
        value = link.counters[counterId];
        if (range[0] <= value && value <= range[1]) {
          link.source = find(link.srcId);
          link.target = find(link.destId);
          links.push(link);

          routers.set(link.src.id, link.src);
          routers.set(link.dest.id, link.dest);
        }
      });

      //console.log('links: ',links.length);
      d3connections = svg.select('.connections').selectAll('.connection')
        .data(bundle(links));

      d3connections.enter()
        .call(Connection);

      d3connections
        .each(function(d) { d.source = d[0]; d.target = d[d.length - 1];})
        .attr("d", line);

      d3connections.exit().remove();
    }

    function filterGreens(routers) {
      var links = [], value;
      data.greens.forEach(function(link) {
        value = link.counters[counterId];
        if (range[0] <= value && value <= range[1]) {
          links.push(link);
          routers.set(link.src.id, link.src);
          routers.set(link.dest.id, link.dest);
        }
      });
    }

    function filterBlacks(routers) {
      var links = [], value;
      data.blacks.forEach(function(link) {
        value = link.counters[counterId];
        if (range[0] <= value && value <= range[1]) {
          links.push(link);
          routers.set(link.src.id, link.src);
          routers.set(link.dest.id, link.dest);
        }
      });
    }

    function renderRouters(routers) {
      var list = [], router, jid, i, id, jobs;
      for (router of routers.values()) {
        list.push(router);
        if (!router.color) {
          jobs = [];
          for (i = 0; i<4; i++) {
            id = router.jobs[i];
            if (jobs.indexOf(id) == -1) jobs.push(id);
          }
          if (jobs.length == 1) router.color = data.job_colors.get(jobs[0]);
          else router.color = MULTI_JOBS_COLOR;

          if (!router.color) {
            router.color = UNKNOWN_JOB_COLOR;
          }
        }
      }

      var d3routers = svg.select('.routers').selectAll('.router')
        .data(list, function(d) { return d.id;});

      d3routers.enter()
        .call(Router);

      d3routers.exit()
        .remove();
    }

    function render() {
      if (!data) return;

      group_arc = d3.svg.arc()
        .innerRadius(opt.innerRadius)
        .outerRadius(opt.outerRadius)
        .cornerRadius(0);

      // Groups
      d3groups = svg.select('.groups').selectAll('.group')
        .data(data.groups, function (d) { return d.id; });

      d3groups.enter()
        .call(Group);

      d3groups.selectAll('path').attr('d', group_arc);

      //Connectors
      //d3connectors = svg.select('.connectors').selectAll('.connector')
      //  .data(data.blueRoutes.nodes, function(d) { return d.id; });
      //
      //d3connectors.enter()
      //  .call(Connector);
    }

    /*
     * Group
     */
    function Group(selection) {
      var g = this.append('g')
                .attr('class', 'group');

      g.append('path')
        .attr('fill', function(d) { return d.color; })
        .attr('d', group_arc);

      return selection;
    }

    function Router(selection) {
      var g = this.append('g')
        .attr('class', 'router')
        .append('circle')
        .attr('cx', function(d) { return d.radius * Math.cos(d.angle-Math.PI/2); })
        .attr('cy', function(d) { return d.radius * Math.sin(d.angle-Math.PI/2);})
        .attr('r', 2)
        .attr('fill', function(d) { return d.color; });

    }
    function Connector(selection) {
      var c = this.append('g')
        .attr('class', 'connector');

      c.append('circle')
        .attr('r', 2)
        .attr('cx', function(d) { return d.r * Math.cos(d.angle-Math.PI/2); })
        .attr('cy', function(d) { return d.r * Math.sin(d.angle-Math.PI/2);});
    }

    function Connection(selection) {
       this.append("path")
          .each(function(d) { d.source = d[0]; d.target = d[d.length - 1];})
          .attr("class", "connection")
          .attr("d", line);
    }

    /*
     * radial
     */
    var radial = {};

    radial.el = function(el) {
      svgContainer = d3.select(el)
        .classed("radial", true)
        .append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

      svg = svgContainer.append("g")
        .attr('transform', 'translate('+WIDTH/2+','+HEIGHT/2+')');

      svg.append('g').attr('class', 'groups');
      svg.append('g').attr('class', 'routers');
      svg.append('g').attr('class', 'connectors');
      svg.append('g').attr('class', 'connections');

      return this;
    };

    radial.resize = function(w, h) {
      svgContainer.attr("width", w).attr("height", h);
      var r = Math.min(w,h)/2;
      svg.attr('transform', 'translate('+r+','+r+')');
      layout.size([w, h]);
      if (data) layout(data);
      render();
      return this;
    };

    radial.data = function(_) {
      if (!arguments.length) return data;
      data = _;
      layout(data);
      render();
      return this;
    };

    radial.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return this;
    };

    radial.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return this;
    };

    radial.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return this;
    };

    radial.filter = function() {
      if (data && range)
        filter();
      return this;
    };



    return radial;
  };
});