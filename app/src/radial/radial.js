/**
 * Created by yarden on 1/30/15.
 */
define(function(require) {

  var d3 = require('d3');
  var Layout = require('radial/layout');
  var LayoutGB = require('radial/layout_gb');
  var model = require('model');
  var BGCanvas = require('radial/bg_canvas');
  var config = require('config');

  return function() {
    var WIDTH = 1000, HEIGHT = 1000,
        INNER_RADIUS = 400, GROUP_HEIGHT = 100;
    var MULTI_JOBS_COLOR = '#00ffff';
    var UNKNOWN_JOB_COLOR = '#a0a0a0';

    var minimum, maximum, valid = false;
    var layout = Layout().size([WIDTH, HEIGHT]),
        layout_gb = LayoutGB(),
        bg_canvas = BGCanvas(),
        opt = layout.parms(),
        mode = 'blue',
        selectedGroup = undefined,
        blueLinks, greenLinks, blackLinks,
        svgContainer, svg;

    var d3groupView, d3groupView2, d3bgView;

    var range, counterId;
    var data, groups, connectors, connections;
    var d3groups, d3connectors, d3connections;


    var group_arc = d3.svg.arc()
      .innerRadius(opt.innerRadius)
      .outerRadius(opt.outerRadius)
      .cornerRadius(0);

    var bundle = d3.layout.bundle();

    var connectionPath = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.4)
      .radius(function(d) { return d.r; })
      .angle(function(d) { return d.angle; });

    function find(key) {
      var ng = data.blueRoutes.children.length;
      for (var i=0; i<ng; i++) {
        if (data.blueRoutes.children[i].id == key.g) {
          var g = data.blueRoutes.children[i];
          var c = g.children[key.c];
          return c.children[key.r];
        }
      }
      return undefined;
    }


    function filter() {
      var routers = new Map();
      filterBlues(routers);
      filterGreens(routers);
      filterBlacks(routers);

      renderRouters(routers);
      renderLinks();
    }

    function filterBlues(routers) {
      var value;
      blueLinks = [];
      data.blues.forEach(function (link) {
        if (range[0] <= link.value && link.value <= range[1]) {
          link.source = find(link.srcId);
          link.target = find(link.destId);
          blueLinks.push(link);

          routers.set(link.src.id, link.src);
          routers.set(link.dest.id, link.dest);
        }
        }
      );
    }

    function filterGreens(routers) {
      var value;
      greenLinks = [];
      data.greens.forEach(function(link) {
        if (range[0] <= link.value && link.value <= range[1]) {
          greenLinks.push(link);
          routers.set(link.src.id, link.src);
          routers.set(link.dest.id, link.dest);
        }
      });
    }

    function filterBlacks(routers) {
      var value;
      blackLinks = [];
      data.blacks.forEach(function(link) {
        if (range[0] <= link.value && link.value <= range[1]) {
          blackLinks.push(link);
          routers.set(link.src.id, link.src);
          routers.set(link.dest.id, link.dest);
        }
      });
    }

    function renderLinks() {
      var i, n;
      //if (selectedGroup == undefined) {
      //  svg.select('.connectors').selectAll('circle').remove();
      //  svg.select('.internal').selectAll('path').remove();
      //
      //  renderBlues();
      //} else {
      //  renderGreens();
      //  //group_view(greenLinks, selectedGroup);
      //  //group_view2(greenLinks, blackLinks, selectedGroup);
      //}
      //bg_view(greenLinks, blackLinks);
      renderBlues();
      bg_canvas(greenLinks, blackLinks);
    }

    function renderBlues() {
      var blue = bundle(blueLinks);
      var i=-1, n=blueLinks.length;
      while (++i < n) {
        blue[i].color = blueLinks[i].vis_color;
      }

      d3connections = svg.select('.connections').selectAll('.connection')
        .data(blue);

      d3connections.enter()
        .call(Connection);

      d3connections
        .each(function (d) { d.source = d[0]; d.target = d[d.length - 1]; })
        .attr('stroke', function(d) { return d.color; })
        .attr("d", connectionPath);

      d3connections.exit().remove();
    }

    function renderGreens() {
      var gLinks = layout_gb(greenLinks, selectedGroup.id);
      var green = bundle(gLinks);
      var i=-1, n=gLinks.length;
      while (++i < n) {
        green[i].color = gLinks[i].vis_color;
      }

      d3connections = svg.select('.connections').selectAll('.connection')
        .data(green/*.concat(black)*/);

      d3connections.enter()
        .call(Connection);

      d3connections
        .each(function (d) { d.source = d[0]; d.target = d[d.length - 1]; })
        .attr('stroke', function(d) { return d.color; })
        .attr("d", connectionPath);

      d3connections.exit().remove();

      var connectors = svg.select('.connectors').selectAll('circle')
        .data(layout_gb.nodes(), function(d) { return d.id;});

      connectors
        .enter()
        .append('circle')
        .attr('r', 1)
        .attr('fill', '#888');

      connectors
        .attr('cx', function(d) { return d.r*Math.cos(d.angle);})
        .attr('cy', function(d) { return d.r*Math.sin(d.angle);});

      connectors.exit().remove();

      var arcs = layout_gb.root().children.map(function(node) {
        return {startAngle:node.children[0].angle, endAngle:node.children[15].angle};
      });

      var size = layout_gb.size();
      var arc = d3.svg.arc()
        .innerRadius(size[1]+4)
        .outerRadius(size[1]+5);

      var paths = svg.select('.internal').selectAll('path')
        .data(arcs);

      paths.enter()
        .append('path')
        .style('stroke', '#666');

      paths
        .attr('d', arc);

      paths.exit().remove();
    }

    function renderRouters(routers) {
      var list = [], router, jid, i, id, jobs;
      for (router of routers.values()) {
        list.push(router);
      }

      var d3routers = svg.select('.routers').selectAll('.router')
        .data(list, function(d) { return d.id;});

      d3routers.enter()
        .call(Router);

      d3routers.selectAll('circle')
        .attr('cx', function(d) { return d.radius * Math.cos(d.angle-Math.PI/2); })
        .attr('cy', function(d) { return d.radius * Math.sin(d.angle-Math.PI/2); })
        .attr('fill', function(d) {return d.color; })
        .attr('r', 3);

      d3routers.exit().selectAll('circle')
        .attr('r', 1);
    }

    function render() {
      if (!data) return;

      group_arc = d3.svg.arc()
        .innerRadius(opt.innerRadius)
        .outerRadius(opt.outerRadius)
        .cornerRadius(0);

      // Groups
      d3groups = svg.select('.groups').selectAll('.group')
        .data(data.groups, function (d) { return d.id; });

      d3groups.enter()
        .call(Group);

      d3groups.selectAll('path').attr('d', group_arc);

      svg.select('.routers').selectAll('.router').remove();
      renderRouters(data.routers);
    }

    /*
     * Group
     */
    function Group(selection) {
      var g = this.append('g')
        .attr('class', 'group');

      g.append('path')
        .attr('fill', function (d) { return d.color; })
        .attr('d', group_arc)
        .on('click', selectGroup);

      return selection;
    }

    function selectGroup(d) {
      var id;
      if (selectedGroup == d) {
        selectedGroup = id = undefined;
        //svg.select('.green-black').selectAll('.something').remove();
      } else {
        if (selectedGroup == undefined) {
          //svg.select('.connections').selectAll('.connection').remove();
        }
        selectedGroup = d;
        id = d.id;
      }

      svg.select('.groups').selectAll('.group')
        .data(data.groups, function (g) { return g.id; })
        .classed('selected', function(g) { return g.id == id; });

      renderLinks();
    }

    function Router(selection) {
      var g = this.append('g')
        .attr('class', 'router')
        .append('circle')
        .attr('r', '2')
        .on('mouseover', function(d) {
          highlight_router(this, d,  true);
        })
        .on('mouseout', function(d) {
          highlight_router(this, d,  false);
        })
        .each(function(d) { d.node = this;});
    }

    function Connector(selection) {
      var c = this.append('g')
        .attr('class', 'connector');

      c.append('circle')
        .attr('r', 2)
        .attr('cx', function(d) { return d.r * Math.cos(d.angle-Math.PI/2); })
        .attr('cy', function(d) { return d.r * Math.sin(d.angle-Math.PI/2);});
    }

    function Connection(selection) {
       this.append("path")
          .each(function(d) { d.source = d[0]; d.target = d[d.length - 1];})
          .attr("class", "connection")
          //.attr('stroke', function(d) { return d.color; })
          .attr("d", connectionPath);
         // .on('mouseover', function(d) {
         //   d3.select(d.source.router.node).attr('r', 5);
         //   d3.select(d.target.router.node).attr('r', 5);
         //} )
         // .on('mouseout', function(d) {
         //  d3.select(d.source.router.node).attr('r', 2);
         //  d3.select(d.target.router.node).attr('r', 2);
         //});
    }

    function highlight_router(router, r, on) {
      if (on) {
        //d3.select(router).attr('r', 5);
        svg.select('.connections').selectAll('.connection')
          .classed('highlight', function(d) { return d.source.router == r || d.target.router == r;} );
      }
      else {
        //d3.select(router).attr('r', 2);
        svg.select('.connections').selectAll('.connection')
          .classed('highlight', false);
      }
    }
    /*
     * radial
     */

    var radial = {};

    radial.el = function(el) {
      var d3el = d3.select(el);
      svgContainer = d3el
        //.classed("radial", true)
        .append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .classed("radial", true);

      svg = svgContainer.append("g");
        //.attr('transform', 'translate('+WIDTH/2+','+HEIGHT/2+')');

      svg.append('g').attr('class', 'groups');
      svg.append('g').attr('class', 'routers');
      svg.append('g').attr('class', 'connectors');
      svg.append('g').attr('class', 'connections');
      svg.append('g').attr('class', 'green-blue');
      svg.append('g').attr('class', 'internal');

      //d3groupView = svgContainer.append('g').attr('class', 'group-view');
      //group_view.svg(d3groupView);
      //
      //d3groupView2 = svgContainer.append('g').attr('class', 'group-view2');
      //group_view2.svg(d3groupView2);
      //d3bgView = svgContainer.append('g').attr('class', 'bg-view');
      //bg_view.svg(d3bgView);

      bg_canvas.el(d3el.append('canvas').attr('id', 'canvas'));

      return this;
    };

    radial.resize = function(w, h) {
      console.log('radial resize:', w, h);
      var offset = 10;

      //var size = bg_view.size();
      var size = bg_canvas.size();
      var r = Math.min(w - size[0], h)/2 - offset;
      //var r = Math.min(w, h)/2 - offset;

      var s = Math.min(w-size[0], h);
      svgContainer.attr("width", s).attr("height", s);
      svg.attr('transform', 'translate('+(r+offset)+','+(r+offset)+')');

      layout.size(r);
      layout_gb.size([opt.innerRadius*0.1, opt.innerRadius*0.75]);

      //d3groupView
      //  .attr('transform', 'translate('+(w-gvSize[0])+','+0+')');
      //
      //d3groupView2
      //  .attr('transform', 'translate('+(w-gvSize[0])+','+gvSize[1]+')');

      //d3bgView.attr('transform', 'translate('+(w-size[0])+',0)');

      d3.select(bg_canvas.el())
        .attr('x', w-size[0]).attr('y', 0);

      if (data) layout(data);
      render();
      if (data && range)
        filter();
      return this;
    };

    radial.data = function(_) {
      if (!arguments.length) return data;
      data = _;
      valid = false;
      layout(data);
      render();
      return this;
    };

    radial.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      valid = false;
      return this;
    };

    radial.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      //console.log('range:',range);
      return this;
    };


    radial.filter = function() {
      if (data && range) {
        filter();
      }
      return this;
    };

    return radial;
  };
});