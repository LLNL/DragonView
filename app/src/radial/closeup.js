/**
 * Created by yarden on 3/28/16.
 */
define(function(require) {

  var d3 = require('d3');
  var config = require('config');
  var model = require('model');

  return function(el) {
    var SIZE = 32, DS = 4;
    var NODE_SIZE = 6;
    var WIDTH = 16 * (SIZE + DS);
    var HEIGHT =  6 * (SIZE + DS);

    var BOX_SIZE = 6;
    var CANVAS_DS  = 4;
    var GREEN_BOX_SIZE = 16 * BOX_SIZE;
    var BLACK_BOX_SIZE =  6 * BOX_SIZE;
    var CANVAS_WIDTH = 6 * (GREEN_BOX_SIZE + CANVAS_DS);
    var CANVAS_HEIGHT = GREEN_BOX_SIZE + 10 + BLACK_BOX_SIZE + 10;

    var div, svg, g, canvas;
    var header;
    var mode = 'routers';
    var currentGreen = [], currentBlack = [];

    setup(el);


    function render_group() {
      //var d3routers = group.select(.)
    }

    var closeup = function(group) {
      if (!group) {
        div.style('display', 'none');
        return;
      }
      div.style('display', 'block');

      header.text(group.id);

      var showNodes = mode == 'nodes';

      var routers = [], nodes = [], rect = [];
      var x= 0, y= DS-SIZE, r, c, n, nr, nc, row, col;

      for (r=0, nr=group.routers.length; r< nr; r++) {
        row = group.routers[r];
        for (c=0, nc=row.length; c< nc; c++) {
          rect.push({id: r*nc+c, router_jobs: row[c].jobs, x: DS/2+c*(SIZE+DS), y: r*(SIZE+DS), width: SIZE, height: SIZE, color: showNodes? '#eaeaea' : row[c].color});
        }
      }

      console.log('num of rect:', rect.length);

      y = -(DS+SIZE);
      if (mode == 'nodes') {
        for (r = 0, nr = group.routers.length; r < nr; r++) {
          row = group.routers[r];
          x = DS;
          y += SIZE + DS;
          for (c = 0, nc = row.length; c < nc; c++) {
            for (n = 0; n < 4; n++) {
              if (row[c].nodes_jobs[n] != null) {
                rect.push({
                  id: (r * nc + c) + '-' + n,
                  x: x,
                  y: y + n * (NODE_SIZE+2),
                  width: SIZE - DS,
                  height: NODE_SIZE,
                  color: row[c].nodes_color[n],
                  node_jobs: row[c].nodes_jobs[n]
                });
              }
            }
            x += SIZE + DS;
          }
        }
      }

      var d3routers = g.selectAll('rect')
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

    closeup.links = function(group, greenLinks, blackLinks) {
      var r, c, x, y;
      var ctx = canvas.getContext('2d');
      var greenBoxes = new Array(model.N_ROWS).fill(false);
      var blackBoxes = new Array(model.N_COLS).fill(false);

      /* clear canvas */
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (!greenLinks)
        greenLinks = currentGreen;
      else
        currentGreen = greenLinks;

      if (!blackLinks)
        blackLinks = currentBlack;
      else
        currentBlack = blackLinks;

      if (!group || (greenLinks.length == 0 && blackLinks.length == 0))
        return;

      // check which box has data
      greenLinks.forEach(function(link) {
        if (link.srcId.g == group.id)
          greenBoxes[link.srcId.r] = true;
      });
      blackLinks.forEach(function(link) {
        if (link.srcId.g == group.id)
          blackBoxes[link.srcId.c] = true;
      });


      // background boxes
      ctx.fillStyle = '#ccc';
      y = 0;
      for(r = 0; r < model.N_ROWS; r++) {
        ctx.beginPath();
        ctx.fillStyle = greenBoxes[r] ? '#ccc' : '#f0f0f0';
        ctx.rect(r * (GREEN_BOX_SIZE+CANVAS_DS), y, GREEN_BOX_SIZE, GREEN_BOX_SIZE);
        ctx.fill();
      }

      y = GREEN_BOX_SIZE + 10;
      for(c = 0; c < model.N_COLS; c++) {
        ctx.beginPath();
        ctx.fillStyle = blackBoxes[c] ? '#ccc' : '#f0f0f0';
        ctx.rect(c * (BLACK_BOX_SIZE+CANVAS_DS), y, BLACK_BOX_SIZE, BLACK_BOX_SIZE);
        ctx.fill();
      }

      // green links
      greenLinks.forEach(function(link) {
        if (link.srcId.g == group.id) {
          x = link.destId.r * (GREEN_BOX_SIZE+CANVAS_DS)+ link.destId.c * BOX_SIZE;
          y = link.srcId.c * BOX_SIZE;
          ctx.fillStyle = link.vis_color;
          ctx.fillRect(x, y, BOX_SIZE, BOX_SIZE);
        }
      });

      offset = GREEN_BOX_SIZE + 10;
      /* black links */
      blackLinks.forEach(function(link) {
        if (link.srcId.g == group.id) {
          x = link.destId.c * (BLACK_BOX_SIZE+CANVAS_DS) + link.destId.r * BOX_SIZE;
          y = offset + link.srcId.r * BOX_SIZE;
          ctx.fillStyle = link.vis_color;
          ctx.fillRect(x, y, BOX_SIZE, BOX_SIZE);
        }
      });
      return this;
    };

    closeup.highlight = function(routers, on) {

    };

    closeup.mode = function(_) {
      mode = _;
      return this;
    };

    closeup.size = function() {
      if (div) return [div[0][0].clientWidth, div[0][0].clientHeight];
      return [WIDTH + 30 + CANVAS_WIDTH, HEIGHT + CANVAS_HEIGHT];
    };

    closeup.highlight_job = function(job, on) {
      g.selectAll('rect')
        .classed('fade', function(d) {
          if (!on) return false;
          if (d.router_jobs) return d.router_jobs.indexOf(job) == -1;
          if (d.node_jobs) return !d.node_jobs.has(job);
          return true;
        });

      return this;
    };

    return closeup;

    function setup(el) {
      div = el
        .attr('id', 'closeup')
        .classed('closeup', true);

      div.append('span')
        .style('vertical-align', 'top')
        .text('Group:');

      header = div.append('b')
        .style('vertical-align', 'top')
        .style('padding-right', 20);

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