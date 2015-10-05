/**
 * Created by yarden on 4/2/15.
 */
define(function(require) {

  var d3 = require('d3');
  var config = require('config');

  return function () {
    var margin = {left: 20, top: 40, right: 10, bottom: 10};
    var w = 2, h = 2, dx = 4, dy = 4;
    var GROUP_X_OFFSET = margin.left; GROUP_Y_OFFSET = margin.top;
    var GREEN_X_OFFSET = margin.left+20, GREEN_Y_OFFSET = margin.top, GREEN_BOX_SIZE = 16*w + dx;
    var BLACK_X_OFFSET = GREEN_X_OFFSET + 6 * GREEN_BOX_SIZE + dx, BLACK_Y_OFFSET = GREEN_Y_OFFSET, BLACK_BOX_SIZE = 6*w + dx;
    var GROUP_HEIGHT = 16*h + dy;
    var width = bx({r:5, c:16}) + margin.right;
    var height = gy({g:15, c:16}) + margin.bottom;
    var groups = new Array(16), greenBoxes= new Array(16), blackBoxes=new Array(16), greenHeader=new Array(6), blackHeader=new Array(16);
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
      var g, r, c, i, j;
      var gw = 6 * GREEN_BOX_SIZE;
      var bh = 6 * h;

      /* clear canvas */
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);

      if (greenLinks.length == 0 && blackLinks.length == 0)
        return;

      // init
      for (j=0; j<6; j++) greenHeader[j] = false;
      for (j=0; j<16; j++) blackHeader[j] = false;
      for (i=0; i<16; i++) {
        groups[i] = false;
        for (j=0; j<6; j++) {
          greenBoxes[i][j] = false;
        }
        for (j=0; j<16; j++) {
          blackBoxes[i][j] = false;
        }
      }

      // check which box has data
      greenLinks.forEach(function(link) {
        greenBoxes[link.srcId.g][link.srcId.r] = true;
      });
      blackLinks.forEach(function(link) {
        blackBoxes[link.srcId.g][link.srcId.c] = true;
      });

      var value;
      for (j=0; j<6; j++) {
        i=-1;
        while (++i<16 && !greenBoxes[i][j]) {}
        greenHeader[j] = i<16;
      }
      for (j=0; j<16; j++) {
        i=-1;
        while (++i<16 && !blackBoxes[i][j]) {}
        blackHeader[j] = i<16;
      }
      for (i=0; i<16; i++) {
        j = -1;
        while (++j < 6 && !greenBoxes[i][j] && !blackBoxes[i][j]) {}
        if (j == 6) {
          while (j < 16 && !blackBoxes[i][j]) {j++;}
        }
        groups[i] = j < 16;
      }


      /* header */
      ctx.font = "14px sans-serif";
      ctx.fillStyle = '#000';
      ctx.fillText('Row All-to-all (Green) links: '+greenLinks.length,
        GREEN_X_OFFSET + 3*GREEN_BOX_SIZE - ctx.measureText("Row All-to-all (Green) links").width/2 - 30,
        GREEN_Y_OFFSET - 20);

      ctx.fillText('Column All-to-all (Black) links: '+blackLinks.length,
        BLACK_X_OFFSET + 8*BLACK_BOX_SIZE - ctx.measureText("Column All-to-all (Black) links").width/2 - 25,
        BLACK_Y_OFFSET - 20);

      ctx.font = "12px sans-serif";
      ctx.save();
      ctx.translate(GROUP_X_OFFSET, GROUP_Y_OFFSET );
      ctx.rotate(-Math.PI/2);
      ctx.textAlign = "bottom";
      ctx.fillText('Group', 0, 7);
      ctx.restore();

      for (i=0; i<6; i++) {
        ctx.fillStyle = greenHeader[i] ? '#008000' : '#a0a0a0';
        ctx.fillText(i, GREEN_X_OFFSET + i*GREEN_BOX_SIZE + GREEN_BOX_SIZE/2 - 8, GREEN_Y_OFFSET - 3);
      }

      for (i=0; i<16; i++) {
        ctx.fillStyle = blackHeader[i] ? '#000' : '#a0a0a0';
        ctx.fillText(i, BLACK_X_OFFSET + i*BLACK_BOX_SIZE + BLACK_BOX_SIZE/2 - 8, BLACK_Y_OFFSET - 3);
      }

      for (g=0; g<16; g++) {
        //if (groups[g]) {
          ctx.fillText(g, GROUP_X_OFFSET, GROUP_Y_OFFSET + g * GROUP_HEIGHT + 9*h);
        //}
      }

      y = GREEN_Y_OFFSET;
      ctx.fillStyle = '#ccc'; //'#93c4df';

      for (g=0; g<16; g++) {
        if (groups[g]) {
          for(r = 0; r < 6; r++) {
            ctx.beginPath();
            ctx.fillStyle = greenBoxes[g][r] ? '#ccc' : '#f0f0f0';
            ctx.rect(GREEN_X_OFFSET + r * GREEN_BOX_SIZE, y, 16 * w, 16 * h);
            ctx.fill();
          }
          for(c = 0; c < 16; c++) {
            ctx.beginPath();
            ctx.fillStyle = blackBoxes[g][c] ? '#ccc' : '#f0f0f0';
            ctx.rect(BLACK_X_OFFSET + c * BLACK_BOX_SIZE, y, 6 * w, 6 * h);
            ctx.fill();
          }
        }
        y += GROUP_HEIGHT;
      }


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

      var i, j;
      for (i=0; i<16; i++) {
        greenBoxes[i] = new Array(6);
        blackBoxes[i] = new Array(16);
      }
      return this;
    };

    layout.size = function() {
      return [width,  height];
    };

    return layout;
  }
});
