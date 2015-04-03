/**
 * Created by yarden on 4/1/15.
 */
define(function(require) {

  var d3 = require('d3');

  return function () {
    var margin = {left:10, top:10, right: 10, bottom:10};
    var dx = 4, dy = 4;
    var router_radius = 2;
    var width = margin.left + 6*(2*router_radius + 17*dx) + margin.right;
    var height = margin.top + 16*(2*router_radius + 7*dy) + margin.bottom;

    var routers, all_routers;
    var el, svg, svgContainer;
    var d3Routers, d3greens;

    var line = d3.svg.line();

    var channels;

    function init() {
      var r, c, row, router;
      routers = [];
      all_routers = [];
      for (r = 0; r<6; r++) {
        row = [];
        for (c = 0; c<16; c++) {
          router = {
            id: r * 16 + c,
            x:  router_radius + r * (2 * router_radius + 17 * dx),
            y:  router_radius + c * (2 * router_radius + 7 * dy)
          };
          row.push(router);
          all_routers.push(router);
        }
        routers.push(row);
      }

      d3Routers.selectAll('.router')
        .data(all_routers)
        .enter()
        .append('circle')
        .attr('class', 'router')
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr('r', router_radius);
    }

    function init_channels() {
      var i, j, x, channel;

      channels = new Array(96);
      x = -dx;
      for (i = 0; i<96; i++) {
        x += dx;
        if (i%16 == 0) { x += 2*router_radius + dx; }
        channels[i] = channel = {x: x, section: new Array(16)};
        for (j = 0; j<16; j++) {
          channel.section[j] = {seg: false, fan_in: false, fan_out: false};
        }
      }
    }

    function clear_channels() {
      var i,j, channel, section;
      for (i = 0; i<96; i++) {
        channel = channels[i];
        for(j = 0; j < 16; j++) {
          section = channel.section[j];
          section.seg = section.fan_in = section.fan_out = false;
        }
      }
    }

    function add(link) {
      var i;
      var channel = channels[link.srcId.r*16 + link.srcId.c];
      var from = Math.min(link.srcId.c, link.destId.c);
      var to = Math.max(link.srcId.c, link.destId.c);

      for (i = from; i<to; i++) {
        channel.section[i].seg = true;
      }
      channel.section[link.srcId.c].fan_in = true;
      channel.section[link.destId.c].fan_out =  true;
    }


    function get_edges() {
      var i, c, x, y, from, channel, edges = [];
      for (i=0; i<96; i++) {
        channel = channels[i];
        c = -1;
        while (++c < 16) {
          if (channel.section[c].seg) {
            from = c;
            while (++c < 16 && channel.section[c].seg);
            edges.push({x1: channel.x, y1: router_radius+from*(2*router_radius+7*dy) + dy/2,
                        x2: channel.x, y2: router_radius+   c*(2*router_radius+7*dy) - dy/2});
          }
        }

        for (c = 0; c<16; c++) {
          if (channel.section[c].fan_in || channel.section[c].fan_out) {
            x = router_radius + Math.floor(i/16) * (2 * router_radius + 17 * dx);
            y = router_radius + c * (2 * router_radius + 7 * dy);
            edges.push({x1: x+router_radius+dx/2, y1: y, x2: channel.x-dx/2, y2: y});
          }
        }
      }
      return edges;
    }

    function getRouter(id) {
      return all_routers[id.r*16 + id.c];
    }

    var layout = function (greenLinks, group) {

      clear_channels();
      greenLinks.forEach(function(link) {
        if (link.srcId.g == group.id) {
          add(link);
        }
      });

      var green = d3greens.selectAll('.green')
        .data(get_edges());

      green.enter()
        .append('line')
        .attr('class', 'green');

      green
        .attr('x1', function(d) { return d.x1;})
        .attr('y1', function(d) { return d.y1;})
        .attr('x2', function(d) { return d.x2;})
        .attr('y2', function(d) { return d.y2;})
        .attr('d', line);

      green.exit().remove();
    };

    layout.svg = function(el) {
      svg = el;
      svg
        .classed("group-view", true)
        .attr('width', width-margin.left-margin.right)
        .attr('height', height-margin.top-margin.bottom)
        .attr('transform', 'translate('+margin.left+','+margin.top+')');

      d3Routers = svg.append('g').attr('class', 'routers');
      d3greens = svg.append('g').attr('class', 'greens');
      init();
      init_channels();
      return this;
    };

    layout.size = function() {
      return [width,  height];
    };

    return layout;
  }
});