/**
 * Created by yarden on 4/2/15.
 */
define(function(require) {

  var d3 = require('d3');
  var config = require('config');

  return function () {
    var margin = {left: 20, top: 15, right: 10, bottom: 10};
    var w = 2, h = 2, dx = 4, dy = 4;
    var GREEN_X_OFFSET = margin.left, GREEN_Y_OFFSET = margin.top, GREEN_BOX_SIZE = 16*w + dx;
    var BLACK_X_OFFSET = GREEN_X_OFFSET + 6 * GREEN_BOX_SIZE + dx, BLACK_Y_OFFSET = GREEN_Y_OFFSET, BLACK_BOX_SIZE = 6*w + dx;
    var GROUP_HEIGHT = 16*h + dy;
    var width = bx({r:5, c:16}) + margin.right;
    var height = gy({g:15, c:16}) + margin.bottom;

    var el, canvas;

    function gx(idx) {
      return GREEN_X_OFFSET + idx.r*GREEN_BOX_SIZE + idx.c*w ;
    }

    function gy(idx) {
      return GREEN_Y_OFFSET + idx.g*GROUP_HEIGHT + idx.c*h;
    }

    function bx(idx) {
      return BLACK_X_OFFSET + idx.c*BLACK_BOX_SIZE + idx.r*w;
    }

    function by(idx) {
      return BLACK_Y_OFFSET + idx.g*GROUP_HEIGHT + idx.r*h;
    }

    var layout = function (greenLinks, blackLinks) {
      var ctx = canvas.getContext('2d');
      var x, y;
      var g, r, c;
      var gw = 6 * GREEN_BOX_SIZE;
      var bh = 6 * h;

      var groups = [], has_data = false;
      for (var i=0; i<16; i++) groups.push(false);

      greenLinks.forEach(function(link) {
        groups[link.srcId.g] = true;
        has_data = true;
      });
      blackLinks.forEach(function(link) {
        groups[link.srcId.g] = true;
        has_data = true;
      });

      /* clear canvas */
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);

      if (!has_data)
        return;

      /* header */
      ctx.font = "12px serif";
      ctx.fillStyle = '#000';
      ctx.fillText('G',    0, GREEN_Y_OFFSET - 5);
      ctx.fillText('Green links', GREEN_X_OFFSET + 3*GREEN_BOX_SIZE - ctx.measureText("Green links").width/2, GREEN_Y_OFFSET - 5);
      ctx.fillText('Black links', BLACK_X_OFFSET + 8*BLACK_BOX_SIZE - ctx.measureText("Black links").width/2, BLACK_Y_OFFSET - 5);

      for (g=0; g<16; g++) {
        if (groups[g]) {
          ctx.fillText(g+1, 0, GREEN_Y_OFFSET + g * GROUP_HEIGHT + 9*h);
        }
      }

      y = GREEN_Y_OFFSET;
      ctx.fillStyle = '#ccc'; //'#93c4df';
      ctx.beginPath();
      for (g=0; g<16; g++) {
        if (groups[g]) {
          for (r=0; r<6; r++)
            ctx.rect(GREEN_X_OFFSET + r*GREEN_BOX_SIZE, y, 16*w, 16*h);
          for (c=0; c<16; c++)
            ctx.rect(BLACK_X_OFFSET + c*BLACK_BOX_SIZE, y, 6*w, 6*h);
        }
        y += GROUP_HEIGHT;
      }
      ctx.fill();

      /* green links */
      greenLinks.forEach(function(link) {
        x = gx(link.destId);
        y = gy(link.srcId);
        ctx.fillStyle = link.vis_color;
        ctx.fillRect(x, y, w, h);
      });

      /* black links */
      blackLinks.forEach(function(link) {
        x = bx(link.destId);
        y = by(link.srcId);
        ctx.fillStyle = link.vis_color;
        ctx.fillRect(x, y, w, h);
      });

      return this;
    };

    layout.el = function(selection) {
      if (!arguments.length) return canvas;
      //selection
      //  .attr('width', width+margin.left+margin.right)
      //  .attr('height', height+margin.top+margin.bottom)
      //  .style('display', 'inline-block');

      canvas = selection.append('canvas')
        .attr('class', 'canvas')
        .attr('width', width)
        .attr('height', height)
        [0][0];

      return this;
    };

    layout.size = function() {
      return [width,  height];
    };

    return layout;
  }
});