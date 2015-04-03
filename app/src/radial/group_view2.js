/**
 * Created by yarden on 4/2/15.
 */
define(function(require) {

  var d3 = require('d3');

  return function () {
    var margin = {left: 10, top: 10, right: 10, bottom: 10};
    var dx = 2, dy = 2;
    var greenOffset = 0;
    var blackOffset = 16*dy+20;
    var width = margin.left + Math.max(16*(6*dx + 5), 7*(16*dx+5)) + margin.right;
    var height = margin.top + blackOffset + 16*dy +  margin.bottom;

    var svg;

    var layout = function (greenLinks, blackLinks, group) {
      var nodes = [], x, y;
      greenLinks.forEach(function(link) {
        if (link.srcId.g == group.id) {
          x = link.srcId.r * (16*dx+5) + link.destId.c*dx;
          y = link.srcId.c * dy;
          nodes.push({x:x,  y:y, color: 'green'});
        }
      });

      blackLinks.forEach(function(link) {
        if (link.srcId.g == group.id) {
          x = link.srcId.c * (6*dx+5) + link.destId.r*dx;
          y = blackOffset + link.srcId.r * dy;
          nodes.push({x:x,  y:y, color: 'black'});
        }
      });

      var d3Nodes = svg.selectAll('.box').data(nodes);

      d3Nodes.enter()
        .append('rect')
        .attr('class', 'box')
        .attr('width', dx)
        .attr('height', dy);

      d3Nodes
        .attr('x', function(d) { return d.x; })
        .attr('y', function(d) { return d.y; })
        .attr('fill', function(d) { return d.color;});

      d3Nodes.exit().remove();
    };


    layout.svg = function(el) {
      svg = el;
      svg
        .classed("group-view2", true)
        .attr('width', width-margin.left-margin.right)
        .attr('height', height-margin.top-margin.bottom)
        .attr('transform', 'translate('+margin.left+','+margin.top+')');

      svg.append('rect')
        .attr('x', -5)
        .attr('y', -5)
        .attr('width', 6*(16*dx+5) + 5)
        .attr('height', 16*dy+10)
        .attr('fill', '#f0f0f0');

      svg.append('rect')
        .attr('x', -5)
        .attr('y', blackOffset-5)
        .attr('width', 16*(6*dx + 5) + 5)
        .attr('height', 6*dy + 10)
        .attr('fill', '#f0f0f0');

      return this;
    };

    layout.size = function() {
      return [width,  height];
    };
    return layout;
  }
});