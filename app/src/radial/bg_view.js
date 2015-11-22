/**
 * Created by yarden on 4/2/15.
 */
define(function(require) {

  var d3 = require('d3');

  return function () {
    var margin = {left: 10, top: 10, right: 10, bottom: 10};
    var w = 2, h = 2, dx = 4, dy = 4;
    var GREEN_X_OFFSET = 0, GREEN_Y_OFFSET = 0, GREEN_ROW_SIZE = 16*w + dx;
    var BLACK_X_OFFSET = 6*GREEN_ROW_SIZE + dx, BLACK_Y_OFFSET = 0, BLACK_COL_SIZE = 6*w + dx;
    var GROUP_SIZE = 16*h + dy;
    var width = margin.left + bx({r:5, c:16}) + margin.right;
    var height = margin.top + gy({g:15, c:16}) +  margin.bottom;

    var svg;

    function gx(idx) {
      return GREEN_X_OFFSET + idx.r*GREEN_ROW_SIZE + idx.c*w ;
    }

    function gy(idx) {
      return GREEN_Y_OFFSET + idx.g*GROUP_SIZE + idx.c*h;
    }

    function bx(idx) {
      return BLACK_X_OFFSET + idx.c*BLACK_COL_SIZE + idx.r*w;
    }

    function by(idx) {
      return BLACK_Y_OFFSET + idx.g*GROUP_SIZE + idx.r*h;
    }

    var layout = function (greenLinks, blackLinks) {
      var nodes = [], x, y;
      greenLinks.forEach(function(link) {
        nodes.push({x:gx(link.destId),  y:gy(link.srcId), color: 'green'});
      });

      blackLinks.forEach(function(link) {
        nodes.push({x:bx(link.destId),  y:by(link.srcId), color: 'black'});
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

      return this;
    };

    layout.size = function() {
      return [width,  height];
    };
    return layout;
  }
});