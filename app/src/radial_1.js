/**
 * Created by yarden on 1/30/15.
 */
define(function(require) {

  var d3 = require('d3');
  var layout = require('layout');

  return function() {
    var WIDTH = 1000, HEIGHT = 1000,
        INNER_RADIUS = 400, GROUP_HEIGHT = 100,
        PAD = 3,
        N_GROUPS = 15;

    var width = WIDTH, height=HEIGHT,
        innerRadius = INNER_RADIUS, groupHeight = GROUP_HEIGHT,
        svgContainer, svg;

    var anchor_vs = 4;

    var groups = [];
    var d3groups;

    var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(innerRadius+groupHeight)
      .padAngle(PAD/INNER_RADIUS)
      .cornerRadius(5)
    ;

    function init() {
      var i= 0, span = 2*Math.PI/N_GROUPS;
      for (; i<N_GROUPS; i++) {
        var g = {
          id: i,
          startAngle: span * i,
          endAngle: span * (i+1),
          color: 'lightgray'
        };
        groups.push(g);
      }
    }

    function render() {
      d3groups = svg.selectAll('.group')
        .data(groups, function (d) { return d.id; });

      d3groups.enter()
        .call(Group);
    }

    /*
     * Group
     */
    function Group(selection) {
      var g = this.append('g')
                .attr('class', 'group');

      g.append('path')
        .attr('fill', function(d) { return d.color; })
        .attr('d', arc);
    }


    var api = {};

    api.el = function(el) {
      svgContainer = d3.select(el)
        .classed("radial", true)
        .append("svg")
        .attr('width', width)
        .attr('height', height);

      svg = svgContainer.append("g")
        .attr('transform', 'translate('+width/2+','+height/2+')');

      d3groups = svg.append('g')
        .attr('class', 'groups');

      render();
      return this;
    };

    api.resize = function(w, h) {
      svgContainer.attr("width", w).attr("height", h);

      render();
      return this;
    };


    init();
    return api;
  };
});