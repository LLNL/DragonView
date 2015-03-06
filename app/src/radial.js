/**
 * Created by yarden on 1/30/15.
 */
define(function(require) {

  var d3 = require('d3');
  var Layout = require('layout');

  return function() {
    var WIDTH = 1000, HEIGHT = 1000,
        INNER_RADIUS = 400, GROUP_HEIGHT = 100,
        groupColor = '#f0f0f0',
        connectorColor = '#9BCDEF';

    var layout = Layout().size([WIDTH, HEIGHT]),
        opt = layout.parms(),
        svgContainer, svg;

    var anchor_vs = 4;
    var range, counterId;
    var data, groups, connectors, connections;
    var d3groups, d3connectors, d3connections;

    var group_arc = d3.svg.arc()
      .innerRadius(opt.innerRadius)
      .outerRadius(opt.outerRadius)
      .cornerRadius(2);

    var connector_arc = d3.svg.arc()
      .innerRadius(opt.connectorsRadius)
      .outerRadius(opt.connectorsRadius+opt.connectorsHeight);

    function init() {
      data.groups.forEach(function(g) {
        g.color = groupColor;
      });

      groups = data.groups.filter(function(g) {return g;});

      connectors = [];
      groups.forEach(function(g) {
        if (g.open) {
          var n= g.connectors.length;
          for (var i=0; i<n; i++) {
            connectors.push(g.connectors[i]);
          }
        }
      });

      connections = new Map();
      var key, entry;
      data.blues.forEach(function(b) {
        key = sprintf("%d.%d:%d.%d", b.sg, b.sr, b.dg, b.dr);
        entry = connections.get(key);
        if (!entry) {
          entry = {id: key, src: data.groups[b.sg].connectors[b.sc], dest:data.groups[b.dg].connectors[b.dc], blues: []};
          connections.set(key, entry);
        }
        entry.blues.push(b);
      });
    }

    function bandwidth(g, r, c, p) {
      var counters = data.groups[g].routers[r][c].port[p];
      if (counters) {
        var value = counters[counterId];
        return (range[0] <= value && value <= range[1]) ? value : 0;
      }
      return 0;
    }

    function filter() {
      //var t0 = performance.now();
      var active = [];
      var counters, value;
      for (var c of connections.values()) {
        var v = c.blues.reduce(function(value, b) {
          return value + bandwidth(b.sg, b.sr, b.sc, b.sp) + bandwidth(b.dg, b.dr, b.dc, b.dp);
        }, 0);
        if (v > 0) active.push(c);
      }

      //var t1 = performance.now();
      //console.log('filter: ',active.length, (t1-t0));
      d3connections = svg.select('.connections').selectAll('.connection')
        .data(active, function(d) { return d.id; });

      d3connections.enter()
        .call(Connection);

      d3connections.exit().remove();
    }

    function render() {

      // Groups
      d3groups = svg.select('.groups').selectAll('.group')
        .data(groups, function (d) { return d.id; });

      d3groups.enter()
        .call(Group);

      // Connectors
      d3connectors = svg.select('.connectors').selectAll('.connector')
        .data(connectors, function(d) { return d.id; });

      d3connectors.enter()
        .call(Connector);
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

    function Connector(selection) {
      var c = this.append('g')
        .attr('class', 'connector');

      c.append('path')
        .attr('fill', function(d) {return connectorColor;})
        .attr('d', connector_arc);
    }

    function Connection(selection) {
      this.append('line')
        .attr('class', 'connection')
        .attr('x1', function(d)  { return d.src.x;})
        .attr('y1', function(d)  { return d.src.y;})
        .attr('x2', function(d)  { return d.dest.x;})
        .attr('y2', function(d)  { return d.dest.y;});
    }

    /*
     * API
     */
    var api = {};

    api.el = function(el) {
      svgContainer = d3.select(el)
        .classed("radial", true)
        .append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

      svg = svgContainer.append("g")
        .attr('transform', 'translate('+WIDTH/2+','+HEIGHT/2+')');

      svg.append('g').attr('class', 'groups');
      svg.append('g').attr('class', 'connectors');
      svg.append('g').attr('class', 'connections');

      return this;
    };

    api.resize = function(w, h) {
      svgContainer.attr("width", w).attr("height", h);
      layout.size(w, h);
      render();
      return this;
    };

    api.data = function(_) {
      if (!arguments.length) return data;
      data = _;
      init();
      layout(data.groups);
      return api;
    };

    api.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return api;
    };

    api.filter = function(_) {
      if (!arguments.length) return range;
      range = _;
      filter();
      return api;
    };

    api.update = function() {
      render();
      return this;
    };


    return api;
  };
});