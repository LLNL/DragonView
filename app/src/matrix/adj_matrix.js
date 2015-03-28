/**
 * Created by yarden on 3/12/15.
 */
define(function(require) {

  var d3 = require('d3');
  var model = require('model');
  var cluster = require('matrix/cluster');

  return function() {
    var WIDTH = 1000, HEIGHT = 1000;
    var svgContainer, svg;
    var srcCluster = cluster('s');
    var destCluster = cluster('d');

    var dx = 10, dy = 2;

    var d3srcs, d3dests, d3cells, d3lines;
    var data, range, counterId;
    var routers;
    var srcNodes, destNodes, cells;

    var scale = d3.scale.linear()
      .range([0, 1]);

    var colormap = {
      g: '#4daf4a',
      b: '#377eb8',
      k: '#404040'
    };

    function update() {
      var n, cellId;
      var value;
      var src, dest, cell;
      var min = range[1], max = range[0];

      srcCluster.clear();
      destCluster.clear();
      cells = d3.map();
      n = 0;

      data.links.forEach(function(link) {
        if (!link.counters) return;
        value = link.counters[counterId];
        if (value < min && value > 0) min = value;
        if (value > max) max = value;
        if (value >= range[0] && value <= range[1]) {
          n++;

          src = srcCluster.add(link.srcId, value);
          dest = destCluster.add(link.destId, value);

          cellId = src.id + ':' + dest.id;
          cell = cells.get(cellId);
          if (!cell) {
            cell = {id: cellId, color: link.color, src: src, dest: dest, links: []};
            cells.set(cellId, cell);
          }
          cell.links.push(link);
        }
      });

      scale.domain([min,  max]);
      //console.log('range: ', min, max);
      //console.log('links: ',n);

      computeValue(srcCluster.root());
      computeValue(destCluster.root());

      layout(srcCluster.root(), 10, 70, true);
      layout(destCluster.root(), 28, 52, false);

      var node, nodes = [];
      for (node of srcCluster.nodes().values()) {
        if (node.value > 0)
          nodes.push(node);
      }

      for (node of destCluster.nodes().values()) {
        if (node.value > 0)
          nodes.push(node);
      }

      //collect(srcCluster.root(), nodes);
      //collect(destCluster.root(), nodes);

      var d3nodes = d3dests.selectAll('rect')
        .data(nodes,  function(d) {return d.id;});

      d3nodes.enter()
        .append('rect');

      d3nodes
        .attr('x', function(d) { return d.x;} )
        .attr('y', function(d) { return d.y;} )
        .attr('width', function(d) { return d.width;})
        .attr('height', function(d) { return d.height;})
        .attr('fill', function(d) { return d.color || 'lightgray';})
        .attr('opacity', function(d) { return scale(d.value); });

      d3nodes.exit()
        .remove();

      // bg lines
      var lines = [];
      var x1 = destCluster.root().x-1,
          x2 = x1 + destCluster.root().width+2,
          y1 = srcCluster.root().y-1,
          y2 = y1 + srcCluster.root().height+2;

      srcCluster.root().children.forEach(function(d) {
        if (d.value > 0)
          lines.push({x1:x1, y1:d.y-1, x2:x2, y2: d.y-1 });
      });

      destCluster.root().children.forEach(function(d) {
        if (d.value > 0)
          lines.push({x1:d.x-1, y1:y1, x2:d.x-1, y2: y2 });
      });

      var l = d3lines.selectAll('line')
                .data(lines);

      l.enter()
        .append('line');

      l.attr('x1', function(d) { return d.x1;})
        .attr('x2', function(d) { return d.x2;})
        .attr('y1', function(d) { return d.y1;})
        .attr('y2', function(d) { return d.y2;});

      l.exit().remove();

      // links
      nodes = [];
      for (cell of cells.values()) {
        if (!cell.src.ignore && !cell.dest.ignore) {
          cell.value = d3.max(cell.links, function(d) { return d.counters[counterId];});
          nodes.push(cell);
        }
      }
      d3nodes = d3cells.selectAll('rect')
        .data(nodes,  function(d) { return d.id; });

      d3nodes.enter()
        .append('rect')
        .attr('width', 4)
        .attr('height', 4)
        .attr('fill', function(d) { return colormap[d.color];});

      d3nodes
        .attr('x', function(d) { return d.dest.x; })
        .attr('y', function(d) { return d.src.y; })
        .attr('opacity', function(d) { return scale(d.value); });

      d3nodes.exit().remove();
    }

    function collect(node, list) {
      list.push(node);
      if (node.open && node.value > 0 && node.children) {
        var n = node.children.length;
        for (var i=0; i<n; i++)
          collect(node.children[i], list);
      }
    }

    function layout(node, x, y, horizontal) {
      var x0 = x,  y0= y;
      var i, n = node.open && node.value > 0 && node.children.length || 0;

      x += dx;
      if (n > 0) {
        for(i = 0; i < n; i++) {
          if (node.children[i].value > 0) {
            y = dy + layout(node.children[i], x,  y,  horizontal);
          }
        }
        y -= dy;
      } else {
        y += 4;
      }
      x -= dx;

      if (horizontal) assign(node, x0, y0, dx - 1, y - y0);
      else  assign(node,  y0,  x0,  y-y0,  dx-1);

      return y;
    }

    function assign(node, x, y, w, h) {
      node.x = x;
      node.y = y;
      node.width = w;
      node.height = h;
    }

    function computeValue(node) {
      if (node.children) {
        node.value = 0;
        var n = node.children.length;
        for(var i = 0; i < n; i++) {
          node.value = Math.max(node.value, computeValue(node.children[i]));
        }
      } else {
        node.value = node.values && d3.max(node.values) || 0;
      }
      return node.value;
    }

    function update1() {
      var cellId, n, i, y, x;
      var value, src, dest, srcId, destId, cell;

      srcNodes = new Map();
      destNodes = new Map();
      cells = new Map();

      var min = range[1], max = range[0];
      n = 0;
      data.links.forEach(function(link) {
        if (!link.counters) return;
        value = link.counters[counterId];
        if (value >= range[0] && value <= range[1]) {
          if (value < min) min = value;
          if (value > max) max = value;
          n++;
          srcId = model.router_id(link.src);
          src = srcNodes.get(srcId);
          if (!src) {
            src = {id: srcId, values: []};
            srcNodes.set(srcId, src);
          }
          src.values.push(value);

          destId = model.router_id(link.dest);
          dest = destNodes.get(destId);
          if (!dest) {
            dest = {id: destId, values: []};
            destNodes.set(destId, dest);
          }
          dest.values.push(value);

          cellId = srcId + ':' + destId;
          cell = cells.get(cellId);
          if (!cell) {
            cell = {id: cellId, color: link.color, src:src,  dest:dest, links: []};
            cells.set(cellId, cell);
          }
          cell.links.push(link);
        }
      });

      scale.domain([min,  max]);

      console.log('links: ',n);

      // sort based on max per src/dest
      var srcArray = [];
      for (src of srcNodes.values()) {
        src.value = d3.max(src.values);
        srcArray.push(src);
      }
      srcArray.sort(function(a, b) { return b.value - a.value;});
      n = srcArray.length;
      y = 50;
      for (i = 0; i<n; i++) {
        if (i<100) {
          srcArray[i].x = 40;
          srcArray[i].y = y;
          y += 5;
        } else {
          srcArray[i].ignore = true;
        }
      }
      if (n > 100)
        srcArray = srcArray.slice(0,100);

      var destArray = [];
      for (dest of destNodes.values()) {
        dest.value = d3.max(dest.values);
        destArray.push(dest);
      }
      destArray.sort(function(a, b) { return b.value - a.value;});
      n = destArray.length;
      x = 50;
      for (i = 0; i<n; i++) {
        if (i < 100) {
          destArray[i].x = x;
          destArray[i].y = 40;
          x += 5;
        } else {
          destArray[i].ignore = true;
        }
      }
      if (n > 100)
        destArray = destArray.slice(0, 100);

      var cellArray = [];
      for (cell of cells.values()) {
        if (!cell.src.ignore && !cell.dest.ignore) {
          cell.value = d3.max(cell.links, function(d) { return d.counters[counterId];});
          cellArray.push(cell);
        }
      }
      console.log('cells: ', cellArray.length, ' / ', cells.size );

      // draw
      var d3nodes = d3srcs.selectAll('rect')
        .data(srcArray,  function(d) {return d.id;});

      d3nodes.enter()
        .append('rect')
        .attr('width', 4)
        .attr('height', 4)
        .attr('fill', 'lightgray');

      d3nodes
        .attr('x', function(d) { return d.x;} )
        .attr('y', function(d) { return d.y;} );

      d3nodes.exit()
        .remove();

      d3nodes= d3dests.selectAll('rect')
        .data(destArray,  function(d) {return d.id;});

      d3nodes.enter()
        .append('rect')
        .attr('width', 4)
        .attr('height', 4)
        .attr('fill', 'lightgray');

      d3nodes
        .attr('x', function(d) { return d.x;} )
        .attr('y', function(d) { return d.y;} );

      d3nodes.exit()
        .remove();

      d3nodes = d3cells.selectAll('rect')
        .data(cellArray,  function(d) { return d.id; });

      d3nodes.enter()
        .append('rect')
        .attr('width', 4)
        .attr('height', 4)
        .attr('fill', function(d) { return colormap[d.color];});

      d3nodes
        .attr('x', function(d) { return d.dest.x; })
        .attr('y', function(d) { return d.src.y; })
        .attr('opacity', function(d) { return scale(d.value); });

      d3nodes.exit().remove();
    }

    var adj = function() {};

    adj.el = function(el) {
      svgContainer = d3.select(el)
        .classed("matrix", true)
        .append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

      svg = svgContainer.append("g");

      d3srcs = svg.append('g').attr('class', 'src');
      d3dests = svg.append('g').attr('class', 'dest');
      d3cells = svg.append('g').attr('class', 'cells');
      d3lines = svg.append('g').attr('class', 'lines');

      return this;
    };

    adj.resize = function(w, h) {
      svgContainer.attr("width", w).attr("height", h);
      //layout.size(w, h);
      if (data && range)
        update();
      return this;
    };

    adj.data = function(_) {
      if (!arguments.length) return data;
      data = _;
      return this;
    };

    adj.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return this;
    };

    adj.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return this;
    };

    adj.update = function() {
      update();
      return this;
    };

    return adj;
  }
});