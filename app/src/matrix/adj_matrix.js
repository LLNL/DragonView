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
    var srcCluster = cluster();
    var destCluster = cluster();

    var x = 30, dx = 5,y = 50, dy = 1;

    var d3srcs, d3dests, d3cells;
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

    var colormap1 = {
      g: '#4daf4a',
      b: '#377eb8',
      k: '#e41a1c'
    };

    function filter() {
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
        if (value >= range[0] && value <= range[1]) {
          if (value < min) min = value;
          if (value > max) max = value;
          n++;

          src = srcCluster.add(link.src, value);
          dest = destCluster.add(link.dest, value);

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
      console.log('links: ',n);

      computeValue(srcCluster.root());
      computeValue(destCluster.root());



      x = 10; dx = 10;
      y = 70; dy = 2;
      layoutSrc(srcCluster.root());

      x = 50; dx = 2;
      y = 30; dy = 10;
      layoutDest(destCluster.root());

      var node, nodes = [];
      for (node of srcCluster.nodes().values()) {
        if (node.value > 0)
          nodes.push(node);
      }

      var d3nodes = d3srcs.selectAll('rect')
        .data(nodes,  function(d) {return d.id;});

      d3nodes.enter()
        .append('rect')
        .attr('fill', 'lightgray');

      d3nodes
        .attr('x', function(d) { return d.x;} )
        .attr('y', function(d) { return d.y;} )
        .attr('width', function(d) { return d.width;})
        .attr('height', function(d) { return d.height;})
        .attr('opacity', function(d) { return scale(d.value); });

      d3nodes.exit()
        .remove();

      // dest
      nodes = [];
      for (node of destCluster.nodes().values()) {
        if (node.value > 0)
          nodes.push(node);
      }

      d3nodes = d3dests.selectAll('rect')
        .data(nodes,  function(d) {return d.id;});

      d3nodes.enter()
        .append('rect')
        .attr('fill', 'lightgray');

      d3nodes
        .attr('x', function(d) { return d.x;} )
        .attr('y', function(d) { return d.y;} )
        .attr('width', function(d) { return d.width;})
        .attr('height', function(d) { return d.height;})
        .attr('opacity', function(d) { return scale(d.value); });

      d3nodes.exit()
        .remove();

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

    function layoutSrc(node) {
      node.x = x;
      node.y = y;

      x += dx;
      var i, n = node.open && node.children.length || 0;

      if (n > 0) {
        for(i = 0; i < n; i++) {
          if (node.children[i].value > 0) {
            layoutSrc(node.children[i]);
            y += dy;
          }
        }
      } else {
        y += 4+dy;
      }
      y -= dy;
      node.width = dx-1;
      node.height = y- node.y;
      x -= dx;

    }

    function layoutDest(node) {
      node.x = x;
      node.y = y;

      y += dy;
      var i, n = node.open && node.children.length || 0;
      if (n > 0) {
        for(i = 0; i < n; i++) {
          if (node.children[i].value > 0) {
            layoutDest(node.children[i]);
            x += dx;
          }
        }
      } else {
        x += 4 + dx;
      }
      x -= dx;
      node.width = x-node.x;
      node.height = dy -1;

      y -= dy;
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

    function filter1() {
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

    function render() {
    }

    var adj = function() {};

    adj.el = function(el) {
      svgContainer = d3.select(el)
        .classed("adjMatrix", true)
        .append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

      svg = svgContainer.append("g");

      d3srcs = svg.append('g').attr('class', 'src');
      d3dests = svg.append('g').attr('class', 'dest');
      d3cells = svg.append('g').attr('class', 'cells');

      return this;
    };

    adj.resize = function(w, h) {
      svgContainer.attr("width", w).attr("height", h);
      //layout.size(w, h);
      render();
      return this;
    };

    adj.data = function(_) {
      if (!arguments.length) return data;
      data = _;
      //layout(data);
      render();
      return this;
    };

    adj.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return this;
    };

    adj.filter = function(_) {
      if (!arguments.length) return range;
      range = _;
      filter();
      return this;
    };

    adj.update = function() {
      render();
      return this;
    };

    return adj;
  }
});