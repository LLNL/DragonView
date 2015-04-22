/**
 * Created by yarden on 3/28/15.
 */
define(function(require) {

  var d3 = require('d3');
  var model = require('model');
  
  return function() {
    var WIDTH = 1000, HEIGHT = 1000;

    var data, counterId, range, select_color='blue';
    var node_map = d3.map();
    var edge_map = d3.map();
    var link_map = d3.map();
    var nodes, edges;
    var container, svgNodes, svgEdges;
    var d3nodes, d3edges;
    var force = d3.layout.force().size([500, 500]);
    var colors = {blue: 'steelblue', green:'green', black:'#333'};
    var comm_file;

    var svgContainer, svg;

    var zoom = d3.behavior.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', zoomed);

    var drag = d3.behavior.drag()
      .origin(function(d) { return d;})
      .on('dragstart', dragstarted)
      .on('drag', dragged)
      .on('dragend', dragended);

    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
      force.start();
      //d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
      d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
      d3.select(this).classed("dragging", false);
    }

    function zoomed() {
      container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    function getNode(rank) {
      var nid = Math.floor(+rank/model.N_CORES);
      var d_node = data.nodes.get(nid);
      if (!d_node) {
        console.log('error: ', rank,  nid);
      }
      var id = d_node.id;
      var node = node_map.get(id);
      if (!node) {
        node = {id:id};
        node_map.set(id, node);
      }
      return node;
    }

    function getEdge(from, to) {
      if (from.id > to.id) {
        var temp = from;
        from = to; to = temp;
      }
      var id = from.id+':'+to.id;
      var edge = edge_map.get(id);
      if (!edge) {
        edge = {id:id, source:from,  target:to};
        edge_map.set(id, edge);
      }
      var f = Math.floor(from.id/4);
      var t = Math.floor(to.id/4);
      var ft = f+':'+t;
      var link = link_map.get(ft);
      if (!link) {
        link = {id:ft, edges:d3.map()};
        link_map.set(ft, link);
      }
      link.edges.set(edge.id, edge);
    }

    function load(filename) {
      force.stop();
      if (filename == comm_file) return;
      comm_file = filename;

      node_map = d3.map();
      edge_map = d3.map();
      link_map = d3.map();
      nodes = [];
      edges = [];

      svgNodes.selectAll('.node').remove();
      svgEdges.selectAll('.link').remove();

      if (!filename) {
        console.log('*** missing name of comm file');
        return;
      }
      var from, to;
      d3.csv(filename, function(comm) {
        if (comm) {
          comm.forEach(function (item) {
            from = getNode(item.from);
            to = getNode(item.to);
            getEdge(from, to);
          }
          );
        }
        nodes = node_map.values();
        edges = edge_map.values();

        var n = nodes.length, i = -1;
        var angle;
        var node;
        while (++i < n) {
          node = nodes[i];
          angle = i * 2 * Math.PI / n;
          node.x = 500 + 500 * Math.cos(angle);
          node.y = 500 + 500 * Math.sin(angle);
        }
        console.log('load comm: ', nodes.length, edges.length);
        render();
      });
    }

    function render() {
      force
        .nodes(nodes)
        .links(edges)
        .on('tick', null)
        .on('end', end)
        .start();

      for (var i=0; i<50; i++) force.tick();
      force.on('tick', update);

      d3edges = svgEdges.selectAll('.edge')
        .data(edges,  function(d) { return d.id; });

      d3edges.enter()
        .append('line')
        .attr('class', 'edge')
        .attr('stroke', '#ddd');

      d3edges.exit()
        .remove();

      d3nodes = svgNodes.selectAll('.node')
        .data(nodes,  function(d) { return d.id;});

      d3nodes.enter()
        .append('circle')
        .attr('class', 'node')
        .attr('cx', function(d) { return d.x;})
        .attr('cy', function(d) { return d.y;})
        .attr('r', 3)
        .attr('fill', 'lightgray')
        .call(drag);

      d3nodes.exit().remove();


    }

    function clamp(x) { return x < 500 ? x : 500;}

    function update() {
      d3nodes
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });

      d3edges
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
    }

    function end() {
      console.log('force done');
    }

    function filter() {
      var value, i, j;
      var map = d3.map(), node;
      var links = [];
      var selected = select_color == 'blue' ? data.blues
                    : select_color == 'green' ? data.greens
                    : select_color == 'black' ? data.blacks
                    : data.links;
      node_map.forEach(function(key, node) { node.value = 0; node.color = '#000'});
      selected.forEach(function(link) {
        //value = link.counters[counterId];
        if (range[0] <= link.value && link.value <= range[1]) {
          var sid = model.node_id(link.srcId.g, link.srcId.r, link.srcId.c, 0);
          for(i = 0; i < 4; i++) {
            node = node_map.get(sid + i);
            if (node) {
              if (link.value > node.value) {
                node.value = link.value;
                node.color = link.vis_color;
              }
              map.set(sid + i, node);
            }
          }
          var did = model.node_id(link.destId.g, link.destId.r, link.destId.c, 0);
          for(i = 0; i < 4; i++) {
            node = node_map.get(did + i);
            if (node) {
              if (link.value > node.value) {
                node.value = link.value;
                node.color = link.vis_color;
              }
              map.set(did + i, node);
            }
          }

          //sid = Math.floor(sid/4);
          //did = Math.floor(did/4);
          //var id = sid < did ? sid+':'+did : did+':'+sid;
          //var l = link_map.get(id);
          //if (l) {
          //  l.edges.forEach(function(entry, value) {
          //    links.push(value);
          //  });
          //}
        }
      });

      //var color = colors[select_color];

      //var d3links = svg.select('.edges').selectAll('.edge')
      //  .data(links,  function(d) { return d.id; });
      //
      //d3links
      //  .attr('stroke', color);
      //
      //d3links.exit()
      //  .attr('stroke', '#ddd');

      var nodes = svgNodes.selectAll('.node')
        .data(map.values(), function(d) { return d.id;});

      nodes
        .attr('fill', function(d) { return d.color;})
        .attr('r', 4);

      nodes.exit()
        .attr('fill', 'lightgray')
        .attr('r', 2);
    }

    var view = {};
    
    view.el = function(el) {
      svgContainer = d3.select(el)
        .classed("view", true)
        .append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

      svg = svgContainer.append("g").call(zoom);

      svg.append("rect")
        .attr("class", "overlay")
        .attr("width", WIDTH)
        .attr("height", WIDTH);

      container = svg.append('g');
      svgEdges = container.append('g').attr('class', 'edges');
      svgNodes = container.append('g').attr('class', 'nodes');

      return this;
    };
    
    view.resize = function(w,h) {
      force.size([w, h]);

      svg.select('.overlay')
        .attr('width', w)
        .attr('height', h);

      return this;
    };

    view.data = function(_) {
      if (!arguments.length) return data;
      data = _;
      load(data.commFile);
      return this;
    };

    view.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return this;
    };

    view.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return this;
    };

    view.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return this;
    };

    view.filter = function() {
      if (data && range)
        filter();
      return this;
    };

    view.select = function(color) {
      select_color = color;
      if (data && range)
        filter();
      return this;
    };

    return view;

  }
});