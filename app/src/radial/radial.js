/**
 * Created by yarden on 1/30/15.
 */
define(function(require) {

  var d3 = require('d3');
  var Layout = require('radial/layout');
  var LayoutGB = require('radial/layout_gb');
  var model = require('model');
  var BlackGreen = require('radial/black_green');
  var config = require('config');
  var Closeup = require('radial/closeup');
  var rendering = false;
  var filter_req = false;
  var router_mapping = 'jobs';

  return function() {
    var WIDTH = 1000, HEIGHT = 1000,
        INNER_RADIUS = 400, GROUP_HEIGHT = 100;
    var MULTI_JOBS_COLOR = '#00ffff';
    var UNKNOWN_JOB_COLOR = '#d0d0d0';

    var minimum, maximum, valid = false;
    var size = [WIDTH, HEIGHT],
        layout = Layout().size([WIDTH, HEIGHT]),
        layout_gb = LayoutGB(),
        bg_overview = BlackGreen(),
        opt = layout.parms(),
        mode = 'blue',
        selectedGroup = undefined,
        blueLinks, greenLinks, blackLinks,
        svgContainer, svg,
        bg_overview_closed = false,
        routersMode = 'routers',
        closeup,
        dispatch = d3.dispatch('active'),
        bg_div, closeup_div;

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
      var routers = d3.map();
      filterBlues(routers);
      filterGreens(routers);
      filterBlacks(routers);

      renderRouters(routers);
      renderLinks();
      dispatch.active(routers);
    }

    function xor(a,b) {
      return !a != !b;
    }

    function reversed_id(link) {
      var d = link.destId;
      var s = link.srcId;
      return model.link_id(d.g, d.r, d.c, s.g, s.r, s.c);
    }

    function filterBlues(routers) {
      var singles = d3.map();
      var other_id;
      var reversed;
      var value, inout = range[2];
      blueLinks = [];
      if (range[0] < range[1]) {
        data.blues.forEach(function (link) {
            if (link.value > 0) {
              if ((range[0] <= link.value && link.value <= range[1]) == inout) {
                link.source = find(link.srcId);
                link.target = find(link.destId);
                blueLinks.push(link);

                routers.set(link.src.id, link.src);
                routers.set(link.dest.id, link.dest);

                other_id = reversed_id(link);
                if (singles.has(other_id)) singles.remove(other_id);
                else singles.set(link.id, link);
              }
            }
        });
      }

      singles.forEach(function(id, link) {
        var other = {
          source: link.target,
          target: link.source,
          dummy: true
        };
        blueLinks.push(other);
      })

    }

    function filterGreens(routers) {
      var value, inout = range[2];
      greenLinks = [];
      if (range[0] < range[1]) {
        data.greens.forEach(function (link) {
            if (link.value > 0) {
              if ((range[0] <= link.value && link.value <= range[1]) == inout) {
                greenLinks.push(link);
                routers.set(link.src.id, link.src);
                routers.set(link.dest.id, link.dest);
              }
            }
        });
      }
    }

    function filterBlacks(routers) {
      var value, inout = range[2];
      blackLinks = [];
      if (range[0] < range[1]) {
        data.blacks.forEach(function (link) {
            if (link.value > 0) {
              if ((range[0] <= link.value && link.value <= range[1]) == inout) {
                blackLinks.push(link);
                routers.set(link.src.id, link.src);
                routers.set(link.dest.id, link.dest);
              }
            }
        });
      }
    }

    function renderLinks() {
      var i, n;
      if (!blueLinks) return;
      renderBlues();
      bg_overview(greenLinks, blackLinks);
      closeup.links(selectedGroup, greenLinks, blackLinks);
    }

    var _n = 0;
    var _t = 0;
    var _t1 = 0;
    var _t2 = 0;
    var _t3 = 0;
    var _t4 = 0;
    var _t5 = 0;
    var _t6 = 0;

    function renderBlues() {
      var t =  performance.now();
      var blue = bundle(blueLinks);
      var i=-1, n=blueLinks.length, b, bl;
      while (++i < n) {
        b = blue[i];
        bl = blueLinks[i];
        b.dummy = bl.dummy;
        b.color = bl.dummy && 'lightgray' || bl.vis_color;
      }

      var t1  = performance.now();
      d3connections = svg.select('.connections').selectAll('.connection')
        .data(blue);

      var t2 = performance.now();
      d3connections.enter()
        .call(Connection);

      var t3 = performance.now();
      d3connections
        .each(function (d) { d.source = d[0]; d.target = d[d.length - 1]; })
        .attr('stroke', function(d) { return d.color; })
        .attr("d", connectionPath);

      var t4 = performance.now();

      d3connections.exit().remove();
      var t5 = performance.now();

      // redraw only first half
      svg.select('.connections').selectAll('.connection')
        .each(function(d) {
          d.len = this.getTotalLength()*0.5;
        })
        .style('stroke-dasharray', function(d) { return d.len});
      var t6 = performance.now();

      _t +=  t4 - t;
      _t1 += t1 -t;
      _t2 += t2 - t1;
      _t3 += t3 - t2;
      _t4 += t4 - t3;
      _t5 += t5 - t4;
      _t6 += t6 - t5;
      _n++;
    }

    function renderGreens() {
      var gLinks = layout_gb(greenLinks, selectedGroup.id);
      var green = bundle(gLinks);
      var i=-1, n=gLinks.length;
      while (++i < n) {
        green[i].color = gLinks[i].vis_color;
      }

      d3connections = svg.select('.connections').selectAll('.connection')
        .data(green);

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
        .attr('r', config.ROUTER_RADIUS)
        .attr('fill', '#888');

      connectors
        .attr('cx', function(d) { return d.r*Math.cos(d.angle);})
        .attr('cy', function(d) { return d.r*Math.sin(d.angle);});

      connectors.exit().remove();

      var arcs = layout_gb.root().children.map(function(node) {
        return {startAngle:node.children[0].angle, endAngle:node.children[node.children.length-1].angle};
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

    function updateRouters() {
      if (routersMode == 'routers')
        svg.select('.routers').selectAll('.router').select('.single')
         .attr('fill', function(d) { return d.color;});
    }

    function renderRouters(routers, r) {
      var list = routers.values();

      var d3routers = svg.select('.routers').selectAll('.router')
        .data(list, function(d) { return d.id;});

      r = r || config.ROUTER_RADIUS;

      d3routers.enter().call(Router);

      if (routersMode == 'routers') {
        d3routers.selectAll('.single')
          .attr('cx', function(d) { return d.radius * Math.cos(d.angle-Math.PI/2); })
          .attr('cy', function(d) { return d.radius * Math.sin(d.angle-Math.PI/2); })
          .attr('fill', function(d) {return d.color; })
          .style('r', r)
          .each(function(r) { r.active = true;})
      } else {
      }

      // d3routers
      //   .classed('fade', false);

      // d3routers.exit()
        // .classed('fade', true);

      d3routers.exit()
        .each(function(r) { r.active = false; })
        .selectAll('circle').style('r', config.ROUTER_RADIUS_INACTIVE);


      /* render bands */
      var nj = data.jobs.size();
      var fraction = d3.range(data.groups.length).map(function() {
        return d3.range(nj+1).map(function() {return 0; });
      });

      var cid;
      list.forEach(function(router) {
        if (router.jobs.length > 0) {
          cid = router.jobs.length == 1 ? router.jobs[0].idx : nj;
          fraction[router.g][cid]++;
        }
      });

      var colors = config.JOBS_COLORMAP/*data.jobsColor*/.concat('#00ffff');
      var bands = [];
      var group, start, end, total;
      var n = data.groups.length;
      var i, j;
      var nrouters = model.N_ROWS * model.N_COLS;
      for (i=0; i<n; i++) {
        group = fraction[i];
        total = 0;
        start = data.groups[i].startAngle;
        end = data.groups[i].endAngle;
        for (j=0; j<nj+1; j++) {
          if (group[j] > 0) {
            bands.push( {color:colors[j],
              startAngle: start+(end-start)*(total)/nrouters,
              endAngle: start+(end-start)*(total+group[j])/nrouters} );
            total += group[j];
          }
        }
      }

      var band_arc = d3.svg.arc()
        .innerRadius(opt.outerRadius+2)
        .outerRadius(opt.outerRadius+7);

      var d3bands = svg.select('.groups').selectAll('.band')
        .data(bands);

      d3bands.enter()
        .append('path')
        .attr('class', 'band');

      d3bands.attr('fill', function(d) { return d.color;} )
        .attr('d', band_arc);

      d3bands.exit().remove();
    }


    function render() {
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
      d3groups.selectAll('text')
        .attr('x', function(d) { return (opt.outerRadius+20)*Math.sin((d.startAngle + d.endAngle)/2) - this.getComputedTextLength()/2; })
        .attr('y', function(d) { return -(opt.outerRadius+20)*Math.cos((d.startAngle + d.endAngle)/2) +6;});

      svg.select('.routers').selectAll('.router').remove();
      renderRouters(data.routers, config.ROUTER_RADIUS);


      closeup(selectedGroup);
      closeup.links(selectedGroup);
    }

    /*
     * Group
     */
    function Group(selection) {
      var g = this.append('g')
        .attr('class', 'group')
        .on('click', selectGroup);

      g.append('path')
        .attr('fill', function (d) { return d.color; })
        .attr('d', group_arc);


      g.append('text')
        .text(function(d, i) { return i; });


      return selection;
    }

    function selectGroup(d) {
      var id, prev = selectedGroup;
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

      closeup(selectedGroup);
      closeup.links(selectedGroup);

      if ((!prev && selectedGroup) ||  (prev && !selectedGroup)) {
        radial.resize(size);
      }
      //renderLinks();
    }

    function Router() {
      var g = this.append('g')
        .attr('class', 'router');

      if (routersMode == 'routers') {
        g.append('circle')
          .attr('class', 'single')
          .on('mouseover', function(d) { highlight_router(this, d,  true);})
          .on('mouseout', function(d) { highlight_router(this, d,  false); })
          .each(function(d) { d.node = this;});
      } else {
        var routerArc = d3.svg.arc();
        g.append('path')
          .classed('nodes', true)
          .attr('d', routerArc)
          .on('mouseover', function(d) { highlight_router(this, d,  true);})
          .on('mouseout', function(d) { highlight_router(this, d,  false); });

        g.selectAll('circle')
          .data(function(d) { return d.nodes_jobs.map(function(j, i) { return {router: d, idx: i}; })})
          .enter()
            .append('circle')
              .attr('cx', function(d, i) { return (d.router.innerRadius + 2 + i*4) * Math.cos(d.router.angle-Math.PI/2); })
              .attr('cy', function(d, i) { return (d.router.innerRadius + 2 + i*4) * Math.sin(d.router.angle-Math.PI/2); })
              .attr('fill', function(d)  {
                return d.router.nodes_color[d.idx] || 'none'; })
              .style('r', 2);
      }
    }


    function router_highlight(routers, on) {
      var stroke = on ? 'black' : 'none';
      var selection = svg.select('.routers').selectAll('.router').data(routers, function (d) {return d.id; });

      if (routersMode == 'routers') {
        selection
          .selectAll('circle')
          .style('r', function(d) { return on ? config.ROUTER_RADIUS_HIGHLIGHT : d.active ? config.ROUTER_RADIUS : config.ROUTER_RADIUS_INACTIVE; });
      } else {
        selection
          .select('path')
          .style('stroke', stroke);
      }

      if (selectedGroup) { closeup.highlight(routers, on); }
    }


    function highlight_router(router, r, on) {
      var list = [r];

      svg.select('.connections').selectAll('.connection')
        .each(function (d) {
          if (d.source.router == r) list.push(d.target.router);
          if (d.target.router == r) list.push(d.source.router);
        });

      router_highlight(list, on);

      if (on) {
        clearTimeout(connectionHighlightTimer);
        svg.select('.connections').selectAll('.connection')
          .each(function(d) { d.fade = !(d.source.router == r || d.target.router == r)})
          .classed('fade', function(d) { return d.fade;})
          .classed('highlight', function(d) { return !d.fade;});
      }
      else {
        unfadeConnections();
      }
    }

    function highlight_job(job, on) {
      var i, job_id = job.id;
      if (routersMode == 'routers') {
        svg.select('.routers').selectAll('.router')
          .classed('fade', function(d) {
            if (on) {
              // d.last_fade = d3.select(this).classed('fade');
              for (i=0; i<d.jobs.length; i++) {
                if (d.jobs[i].id == job_id) return false;
              }
              return true;
            } else {
              return false;
              // return d.last_fade;
            }
          });
      } else {
        svg.select('.routers').selectAll('.router').selectAll('circle')
          .classed('fade', function(d) {
            return on && (d.router.nodes_jobs[d.idx] == undefined  || !d.router.nodes_jobs[d.idx].has(job));
          });
      }
    }

    var connectionHighlightTimer;

    function unfadeConnections() {
      connectionHighlightTimer = setTimeout(function () {
          svg.select('.connections').selectAll('.connection')
            .classed('fade', false)
            .classed('highlight', false);
        },
        50);
    }

    function highlight_connections(selection, on) {
      var opacity = on ? 0 : 1;
      if (on) {
        clearTimeout(connectionHighlightTimer);
        svg.select('.connections').selectAll('.connection')
          .classed('fade', true)
          .classed('highlight', false);
        selection
          .classed('fade', false)
          .classed('highlight', true);
      } else {
        unfadeConnections();
      }
    }

    function Connector(selection) {
      var c = this.append('g')
        .attr('class', 'connector');

      c.append('circle')
        .attr('r', config.ROUTER_RADIUS)
        .attr('cx', function(d) { return d.r * Math.cos(d.angle-Math.PI/2); })
        .attr('cy', function(d) { return d.r * Math.sin(d.angle-Math.PI/2);});
    }

    function Connection(selection) {
      this.append("path")
        .each(function(d) { d.source = d[0]; d.target = d[d.length - 1];})
        .attr("class", "connection")
        .attr("d", connectionPath)
        .on('mouseover', function(d) {
          if (d.dummy) return;
          router_highlight([d.source.router, d.target.router], true);
          highlight_connections(d3.select(this), true);
        })
        .on('mouseout', function(d) {
          if (d.dummy) return;
          router_highlight([d.source.router, d.target.router], false);
          highlight_connections(d3.select(this), false);
        });
    }

    function set_mode(mode) {
      routersMode = mode;
      opt.groupHeight = mode == 'routers' ? opt.routersGroupHeight : opt.nodesGroupHeight;
      layout.size(layout.size());
      if (data) {
        layout(data);
        closeup.mode(mode);
        render();
        if (range)
          filter();
      }
    }

    /*
     * radial
     */

    var radial = {};

    radial.el = function(el) {
      var d3el = d3.select(el);

      svgContainer = d3el.append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .classed("radial", true);

      svg = svgContainer.append("g");

      svg.append('g').attr('class', 'groups');
      svg.append('g').attr('class', 'routers');
      svg.append('g').attr('class', 'connectors');
      svg.append('g').attr('class', 'connections');
      svg.append('g').attr('class', 'green-blue');
      svg.append('g').attr('class', 'internal');
      svg.append('circle')
        .attr('class', 'inputRing')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('stroke', 'lightgray')
        .attr('fill', 'none');

      var mode = d3el.append('div').style('position', 'absolute');
      mode.append('label')
        .attr('class', 'sub-label')
        .text('Routers')
        .append('input')
        .attr('type', 'radio')
        .attr('name', 'mode')
        .attr('value', 'routers')
        .property('checked', true)
        .on('change', function () { set_mode(this.value); });
      mode.append('label')
        .attr('class', 'sub-label')
        .text('Nodes')
        .append('input')
        .attr('type', 'radio')
        .attr('name', 'mode')
        .attr('value', 'nodes')
        .on('change', function () { set_mode(this.value); });

      bg_div = d3el.append('div')
        .attr('id', 'bg-div')
        .style('position', 'absolute')
        .style('overflow', 'hidden');

      d3el.append('button')
        .attr('id', 'bg-button')
        .style('position', 'fixed')
        .style('right', 10)
        .style('top', 30)
        .text('>>')
        .on('click', function() {
          bg_overview_closed = !bg_overview_closed;
          bg_div.classed('closed', bg_overview_closed);
          bg_div.select('bg-button').text(bg_overview_closed && '<<' || '>>');
          radial.resize(size);
        });

      bg_overview.el(bg_div);

      closeup_div = d3el.append('div')
        .style('position', 'absolute');

      closeup = Closeup(closeup_div);

      return this;
    };

    radial.resize = function(_) {
      size = _;
      var offset = 30;

      var bg_size = bg_overview.size();
      var closeup_size = closeup.size();

      var s = Math.max(0, Math.min(size[0]-bg_size[0], size[1]-closeup_size[1]));

      bg_div.style('left', s);
      closeup_div.style('top', offset+Math.max(s, bg_size[1]));

      svgContainer.attr("width", s).attr("height", s);

      var r = s/2;
      svg.attr('transform', 'translate('+(r)+','+(r)+')');

      layout.size(r);
      layout_gb.size([opt.innerRadius*0.1, opt.innerRadius*0.75]);

      if (data) {
        layout(data);
        render();
        if (range)
          filter();
      }
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
      updateRouters();
      return this;
    };

    radial.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return this;
    };


    radial.filter = function() {
      if (data && range) filter();
      return this;
    };

    radial.cmap_changed = function() {
      renderLinks();
      updateRouters();
      return this;
    };

    radial.highlight_job = function(job, on) {
      highlight_job(job, on);
      closeup.highlight_job(job, on);
      return this;
    };

    radial.update_routers = function() {
      updateRouters();
      return this;
    };

    radial.on = function(type, cb) {
      dispatch.on(type, cb);
      return this;
    };

    return radial;
  }
});