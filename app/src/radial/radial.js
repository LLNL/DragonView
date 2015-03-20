/**
 * Created by yarden on 1/30/15.
 */
define(function(require) {

  var d3 = require('d3');
  var Layout = require('radial/layout');

  return function() {
    var WIDTH = 1000, HEIGHT = 1000,
        INNER_RADIUS = 400, GROUP_HEIGHT = 100;

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
      .angle(function(d) { return d.angle-Math.PI/2; });


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
      var links = [], value;

      data.blues.forEach(function(l) {
        if (l.counters) {
          value = l.counters[counterId];
          if (range[0] <= value && value <= range[1]) {
            l.source = find(l.src);
            l.target = find(l.dest);
            links.push(l);
          }
        }
      });

      console.log('links: ',links.length);
      d3connections = svg.select('.connections').selectAll('.connection')
        .data(bundle(links));

      d3connections.enter()
        .call(Connection);

      d3connections.exit().remove();
    }

    function render() {
      if (!data) return;

      // Groups
      d3groups = svg.select('.groups').selectAll('.group')
        .data(data.groups, function (d) { return d.id; });

      d3groups.enter()
        .call(Group);

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
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1];})
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
      svg.append('g').attr('class', 'connectors');
      svg.append('g').attr('class', 'connections');

      return this;
    };

    radial.resize = function(w, h) {
      svgContainer.attr("width", w).attr("height", h);
      layout.size(w, h);
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
      if (data)
        filter();
      return this;
    };



    return radial;
  };
});