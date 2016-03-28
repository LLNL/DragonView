/**
 * Created by yarden on 3/28/16.
 */
define(function(require) {

  var d3 = require('d3');
  var config = require('config');
  var model = require('model');

  return function(el) {
    var SIZE = 32;
    var NODE_SIZE = 6;
    var WIDTH = 16 * (SIZE + 4);
    var HEIGHT =  6 * (SIZE + 4);
    var CANVAS_DH = 4;
    var CANVAS_WIDTH = 6 * 16 * (CANVAS_DH + 2);
    var CANVAS_HEIGHT = 16 * (CANVAS_DH + 2) + 10 + 6 * (CANVAS_DH+2);

    var div, svg, g, canvas;
    var header;
    var mode = 'routers';

    setup(el);


    function render_group() {
      //var d3routers = group.select(.)
    }

    var closeup = function(group) {
      header.text("Group: "+group.id);

      var showNodes = mode == 'nodes';

      var routers = [], nodes = [], rect = [];
      var x= 0, y= 2-SIZE, r, c, n, nr, nc, row, col;

      for (r=0, nr=group.routers.length; r< nr; r++) {
        row = group.routers[r];
        for (c=0, nc=row.length; c< nc; c++) {
          rect.push({id: r*nc+c, x: c*(SIZE+4)+2, y: 2+r*(SIZE+4), width: SIZE, height: SIZE, color: showNodes? '#eaeaea' : row[c].color});
        }
      }

      y = -2-SIZE;
      if (mode == 'nodes') {
        for (r = 0, nr = group.routers.length; r < nr; r++) {
          row = group.routers[r];
          x = 4;
          y += SIZE + 4;
          for (c = 0, nc = row.length; c < nc; c++) {
            for (n = 0; n < 4; n++) {
              if (row[c].nodes_jobs[n] != null) {
                rect.push({
                  id: (r * nc + c) + '-' + n,
                  x: x,
                  y: y + n * (NODE_SIZE+2),
                  width: SIZE - 4,
                  height: NODE_SIZE,
                  color: row[c].nodes_jobs[n]
                });
                console.log('id:', (r * nc + c) + '-' + n, 'x:', x, 'y:', y + n * NODE_SIZE, 'width:', SIZE - 4, 'height:', NODE_SIZE, 'color:', row[c].nodes_jobs[n]);
              }
            }
            x += SIZE + 4;
          }
        }
      }

      var d3routers = g.selectAll('.router')
        .data(rect, function(d) { return d.id;});

      d3routers.enter()
        .append('rect');

      d3routers
        .attr('x', function(d) { return d.x;})
        .attr('y', function(d) { return HEIGHT - d.y-d.height;})
        .attr('width', function(d) { return d.width;})
        .attr('height', function(d) { return d.height;})
        .attr('fill', function(d) { return d.color;});

      d3routers.exit().remove();
    };

    closeup.links = function(green, black) {
      return this;
    };

    closeup.mode = function(_) {
      mode = _;
      return this;
    };

    return closeup;

    function setup(el) {
      div = el.append('div')
        .attr('id', 'closeup')
        .classed('closeup', true);

      header = div.append('p')
        .text('Group:');

      svg = div.append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

      g = svg.append("g")
        .classed('closeup-group', true);

      canvas = div.append('canvas')
        .attr('class', 'canvas')
        .attr('width', CANVAS_WIDTH)
        .attr('height', CANVAS_HEIGHT)
        [0][0];
    }
  }

});