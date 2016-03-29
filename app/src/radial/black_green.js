/**
 * Created by yarden on 4/2/15.
 */
define(function(require) {

  var d3 = require('d3');
  var config = require('config');
  var model = require('model');

  return function () {
    var margin = {left: 20, top: 40, right: 10, bottom: 10};
    var w = 2, h = 2, dx = 4, dy = 4;
    var GROUP_X_OFFSET = margin.left, GROUP_Y_OFFSET = margin.top;
    var GREEN_X_OFFSET = margin.left+20, GREEN_Y_OFFSET = margin.top, GREEN_BOX_SIZE = model.N_COLS*w + dx;
    var BLACK_X_OFFSET = GREEN_X_OFFSET +model.N_ROWS * GREEN_BOX_SIZE + dx, BLACK_Y_OFFSET = GREEN_Y_OFFSET, BLACK_BOX_SIZE = model.N_ROWS*w + dx;
    var GROUP_HEIGHT = model.N_COLS*h + dy;
    var width = bx({r:model.N_ROWS-1, c:model.N_COLS}) + margin.right;
    var height = gy({g:model.N_GROUPS-1, c:model.N_COLS}) + margin.bottom;
    var groups = new Array(model.N_GROUPS), greenBoxes= new Array(model.N_GROUPS), blackBoxes=new Array(model.N_GROUPS), greenHeader=new Array(model.N_ROWS), blackHeader=new Array(model.N_COLS);
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
      var gw = model.N_ROWS * GREEN_BOX_SIZE;
      var bh = model.N_ROWS * h;

      /* clear canvas */
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);

      if (greenLinks.length == 0 && blackLinks.length == 0)
        return;

      // init
      for (j=0; j<model.N_ROWS; j++) greenHeader[j] = false;
      for (j=0; j<model.N_COLS; j++) blackHeader[j] = false;
      for (i=0; i<model.N_GROUPS; i++) {
        groups[i] = false;
        for (j=0; j<model.N_ROWS; j++) {
          greenBoxes[i][j] = false;
        }
        for (j=0; j<model.N_COLS; j++) {
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
      for (j=0; j<model.N_ROWS; j++) {
        i=-1;
        while (++i<model.N_GROUPS && !greenBoxes[i][j]) {}
        greenHeader[j] = i<model.N_COLS;
      }
      for (j=0; j<model.N_COLS; j++) {
        i=-1;
        while (++i<model.N_GROUPS && !blackBoxes[i][j]) {}
        blackHeader[j] = i<model.N_COLS;
      }
      for (i=0; i<model.N_GROUPS; i++) {
        j = -1;
        while (++j < model.N_ROWS && !greenBoxes[i][j] && !blackBoxes[i][j]) {}
        if (j == model.N_ROWS) {
          while (j < model.N_COLS && !blackBoxes[i][j]) {j++;}
        }
        groups[i] = j < model.N_GROUPS;
      }


      /* header */
      ctx.font = "12px sans-serif";
      ctx.fillStyle = '#000';
      //var text = 'Row All-to-all (Green) links: '+greenLinks.length;
      var text = 'Green: '+greenLinks.length;
      ctx.fillText(text,
        GREEN_X_OFFSET + (model.N_ROWS*GREEN_BOX_SIZE - ctx.measureText(text).width)/2,
        GREEN_Y_OFFSET - 20);

      //text = 'Column All-to-all (Black) links: '+blackLinks.length;
      text = 'Black: '+blackLinks.length;
      ctx.fillText(text,
        BLACK_X_OFFSET + (model.N_COLS*BLACK_BOX_SIZE - ctx.measureText(text).width)/2,
        BLACK_Y_OFFSET - 20);

      ctx.font = "12px sans-serif";
      ctx.save();
      ctx.translate(GROUP_X_OFFSET, GROUP_Y_OFFSET );
      ctx.rotate(-Math.PI/2);
      ctx.textAlign = "bottom";
      ctx.fillText('Group', 0, 7);
      ctx.restore();

      for (i=0; i<model.N_ROWS; i++) {
        ctx.fillStyle = greenHeader[i] ? '#008000' : '#a0a0a0';
        ctx.fillText(i, GREEN_X_OFFSET + i*GREEN_BOX_SIZE + GREEN_BOX_SIZE/2 - 8, GREEN_Y_OFFSET - 3);
      }

      for (i=0; i<model.N_COLS; i++) {
        ctx.fillStyle = blackHeader[i] ? '#000' : '#a0a0a0';
        ctx.fillText(i, BLACK_X_OFFSET + i*BLACK_BOX_SIZE + BLACK_BOX_SIZE/2 - 8, BLACK_Y_OFFSET - 3);
      }

      for (g=0; g<model.N_GROUPS; g++) {
        //if (groups[g]) {
          ctx.fillText(g, GROUP_X_OFFSET, GROUP_Y_OFFSET + g * GROUP_HEIGHT + 9*h);
        //}
      }

      y = GREEN_Y_OFFSET;
      ctx.fillStyle = '#ccc'; //'#93c4df';

      for (g=0; g<model.N_GROUPS; g++) {
        if (groups[g]) {
          for(r = 0; r < model.N_ROWS; r++) {
            ctx.beginPath();
            ctx.fillStyle = greenBoxes[g][r] ? '#ccc' : '#f0f0f0';
            ctx.rect(GREEN_X_OFFSET + r * GREEN_BOX_SIZE, y, model.N_COLS * w, model.N_COLS * h);
            ctx.fill();
          }
          for(c = 0; c < model.N_COLS; c++) {
            ctx.beginPath();
            ctx.fillStyle = blackBoxes[g][c] ? '#ccc' : '#f0f0f0';
            ctx.rect(BLACK_X_OFFSET + c * BLACK_BOX_SIZE, y, model.N_ROWS * w, model.N_ROWS * h);
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

      canvas = selection.append('canvas')
        .attr('class', 'canvas')
        .attr('width', width)
        .attr('height', height)
        [0][0];

      var i, j;
      for (i=0; i<model.N_GROUPS; i++) {
        greenBoxes[i] = new Array(model.N_ROWS);
        blackBoxes[i] = new Array(model.N_COLS);
      }
      return this;
    };

    layout.size = function() {
      //console.log('canvas:',canvas.clientWidth, canvas.clientHeight);
      return [canvas.clientWidth, canvas.clientHeight];
      //return [width,  height];
    };

    return layout;
  }
});
