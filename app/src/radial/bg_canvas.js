/**
 * Created by yarden on 4/2/15.
 */
define(function(require) {

  var d3 = require('d3');
  var config = require('config');

  return function () {
    var margin = {left: 10, top: 10, right: 10, bottom: 10};
    var w = 2, h = 2, dx = 4, dy = 4;
    var GREEN_X_OFFSET = 0, GREEN_Y_OFFSET = 0, GREEN_ROW_SIZE = 16*w + dx;
    var BLACK_X_OFFSET = 6 * GREEN_ROW_SIZE + dx, BLACK_Y_OFFSET = 0, BLACK_COL_SIZE = 6*w + dx;
    var GROUP_SIZE = 16*h + dy;
    var width = margin.left + bx({r:5, c:16}) + margin.right;
    var height = margin.top + gy({g:15, c:16}) +  margin.bottom;

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
      var ctx = canvas.getContext('2d');
      var x, y;
      var g, r, c;
      var gw = 6 * GREEN_ROW_SIZE;
      var bh = 6 * h;

      var groups = [];
      for (var i=0; i<16; i++) groups.push(false);

      greenLinks.forEach(function(link) {
        groups[link.srcId.g] = true;
      });
      blackLinks.forEach(function(link) {
        groups[link.srcId.g] = true;
      });

      /* clear canvas */
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);

      y = GREEN_Y_OFFSET;
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      for (g=0; g<16; g++) {
        if (groups[g]) {
          for (r=0; r<6; r++)
            ctx.rect(GREEN_X_OFFSET + r*GREEN_ROW_SIZE, y, 16*w, 16*h);
          for (c=0; c<16; c++)
            ctx.rect(BLACK_X_OFFSET + c*BLACK_COL_SIZE, y, 6*w, 6*h);
        }
        y += GROUP_SIZE;
      }
      ctx.fill();

      /* green links */
      ctx.fillStyle = 'green';
      greenLinks.forEach(function(link) {
        x = gx(link.destId);
        y = gy(link.srcId);
        ctx.fillStyle = link.vis_color;
        ctx.fillRect(x, y, w, h);
      });

      /* black links */
      ctx.fillStyle = 'black';
      blackLinks.forEach(function(link) {
        x = bx(link.destId);
        y = by(link.srcId);
        ctx.fillStyle = link.vis_color;
        ctx.fillRect(x, y, w, h);
      });

      //ctx.strokeStyle = '#d0d0d0';
      //ctx.lineWidth = 0.5;
      //ctx.beginPath();
      //var y1;
      //for (var g=0; g<16; g++) {
      //  y = gy({g:g, c:0})-2;
      //  ctx.moveTo(margin.left, y);
      //  ctx.lineTo(width-margin.right, y);
      //}
      //
      //for (var r=0; r<7; r++) {
      //  x = bx({r:r, c:0});
      //  ctx.moveTo(x, margin.top);
      //  ctx.lineTo(x, height- margin.top);
      //}
      //
      //for (var c=0; c<17; c++) {
      //  x = BLACK_X_OFFSET + c*BLACK_COL_SIZE;
      //  ctx.moveTo(x, margin.top);
      //  ctx.lineTo(x, height- margin.top);
      //}
      //
      // ctx.stroke();
      return this;
    };

    layout.el = function(selection) {
      if (!arguments.length) return canvas;
      canvas = document.getElementById('canvas');
      selection
        .attr('width', width)
        .attr('height', height)
        .style('border', '1px solid #c3c3c');
      return this;
    };

    layout.size = function() {
      return [width,  height];
    };

    return layout;
  }
});