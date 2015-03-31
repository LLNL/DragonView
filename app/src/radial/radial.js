/**
 * Created by yarden on 1/30/15.
 */
define(function(require) {

  var d3 = require('d3');
  var Layout = require('radial/layout');
  var model = require('model');

  return function() {
    var WIDTH = 1000, HEIGHT = 1000,
        INNER_RADIUS = 400, GROUP_HEIGHT = 100;

    var layout = Layout().size([WIDTH, HEIGHT]),
        opt = layout.parms(),
        svgContainer, svg;

    var range, counterId;
    var data, groups, connectors, connections;
    var d3groups, d3connectors, d3connections;
    var d3greenLinksArc, d3greenLinksConn, d3blueLinks;

    var group_arc = d3.svg.arc()
      .innerRadius(opt.innerRadius)
      .outerRadius(opt.outerRadius)
      .cornerRadius(0);

    var bundle = d3.layout.bundle();
    var line = d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.2)
      .radius(function(d) { return d.r; })
      .angle(function(d) { return d.angle; });

    var curveAngle = 0.5;
    var arc = d3.svg.arc()
      .startAngle(function(d){
            var angle = Math.min(d.src.angle, d.dest.angle);
            return angle + (curveAngle*Math.PI/180);
        })
      .endAngle(function(d){
        var angle = Math.max(d.src.angle, d.dest.angle);
        return angle - (curveAngle*Math.PI/180);
        })
      .innerRadius(function(d){return d.src.radius+5;})
      .outerRadius(function(d){return d.dest.radius+5;});

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

      // nodes
      var nodes = [];
      for (var node of routers.values()) {
        nodes.push(node);
      }

      var d3routers = svg.select('.routers').selectAll('.router')
        .data(nodes, function(d) { return d.id;});

      d3routers.enter()
        .call(Router);

      d3routers.exit()
        .remove();
    }

    function filterBlues(routers) {
      var links = [], value;

      data.blues.forEach(function(link) {
        value = link.counters[counterId];
        if (range[0] <= value && value <= range[1]) {
          link.source = find(link.srcId);
          link.target = find(link.destId);
          links.push(link);

          routers.set(link.src.id, link.src);
          routers.set(link.dest.id, link.dest);
        }
      });

      //console.log('links: ',links.length);
      d3connections = svg.select('.connections').selectAll('.connection')
        .data(bundle(links));

      d3connections.enter()
        .call(Connection);

      d3connections
        .each(function(d) { d.source = d[0]; d.target = d[d.length - 1];})
        .attr("d", line);

      d3connections.exit().remove();
    }

    function filterGreens(routers) {
      var links = [], value;
      //console.log("data : ", data);

      data.greens.forEach(function(link) {
        value = link.counters[counterId];
        if (range[0] <= value && value <= range[1]) {
          links.push(link);
          routers.set(link.src.id, link.src);
          routers.set(link.dest.id, link.dest);
        }
      });
      //console.log(links.length);

      d3greenLinksArc = svg.select('.greenLinks').selectAll('.greenLink')
          .data(links);

      d3greenLinksArc.enter()
          .call(GreenLinkArc);

      d3greenLinksArc
          .each(function(d){d.source = d[0];d.target = d[d.length-1];})
          .attr("d", arc);

      d3greenLinksArc.exit().remove();

      d3greenLinksConn = svg.select('.greenLinksConnectors').selectAll('.greenLink')
          .data(links);

      d3greenLinksConn.enter()
          .call(GreenLinkConn);

      //d3greenLinksConn
      //    .each(function(d){d.source = d[0];d.target = d[d.length-1];})
      //    .attr("d", arcConn);

      d3greenLinksConn.exit().remove();
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

      //Connectors
      //d3connectors = svg.select('.connectors').selectAll('.connector')
      //  .data(data.blueRoutes.nodes, function(d) { return d.id; });
      //
      //d3connectors.enter()
      //  .call(Connector);
    }

    /*
     * Group
     */
    function Group(selection) {
      var g = this.append('g')
                .attr('class', 'group');

      g.append('path')
        .attr('fill', function(d) { return d.color; })
        .attr('d', group_arc);

      return selection;
    }

    function Router(selection) {
      var g = this.append('g')
        .attr('class', 'router')
        .append('circle')
        .attr('cx', function(d) { return d.radius * Math.cos(d.angle-Math.PI/2); })
        .attr('cy', function(d) { return d.radius * Math.sin(d.angle-Math.PI/2);})
        .attr('r', 2)
        .attr('fill', '#888888');

    }
    function Connector(selection) {
      var c = this.append('g')
        .attr('class', 'connector');

      c.append('circle')
        .attr('r', 2)
        .attr('cx', function(d) { return d.r * Math.cos(d.angle-Math.PI/2); })
        .attr('cy', function(d) { return d.r * Math.sin(d.angle-Math.PI/2);});
    }
    //-------------------------------------------------------
    function Connection(selection) {
       this.append("path")
          .each(function(d) {
               d.source = d[0]; d.target = d[d.length - 1];
           })

          .attr("class", "connection")
          .attr("d", line);
    }

    function GreenLinkArc(selection){
        this.append("path")
            .each(function(d){
                d.source = d[0]; d.target = d[d.length - 1];
            })
            .attr("class", "greenLink")
            .attr("d", arc);
    }

    function GreenLinkConn(selection){

        this.append("path")
            .attr("class", "greenLink")
           .attr('d', function(d){
                var src = d.src;
                var dest = d.dest;

                var linkAngle = dest.angle - src.angle;
                if(linkAngle < 0){
                    var temp = src;
                    src = dest;
                    dest = temp;
                }

                source1X =src.radius * Math.cos(src.angle-Math.PI/2);
                source1Y =src.radius * Math.sin(src.angle-Math.PI/2);
                controlPt1X =(src.radius+2) * Math.cos(src.angle-Math.PI/2-(curveAngle*Math.PI/180));
                controlPt1Y = (src.radius+2) * Math.sin(src.angle-Math.PI/2-(curveAngle*Math.PI/180));
                target1X = (src.radius+5) * Math.cos(src.angle-Math.PI/2 + (curveAngle*Math.PI/180));
                target1Y = (src.radius+5) * Math.sin(src.angle-Math.PI/2 + (curveAngle*Math.PI/180));

                source2X = dest.radius * Math.cos(dest.angle-Math.PI/2);
                source2Y = dest.radius * Math.sin(dest.angle-Math.PI/2);
                controlPt2X = (dest.radius+2) * Math.cos(dest.angle-Math.PI/2+(curveAngle*Math.PI/180));
                controlPt2Y = (dest.radius+2) * Math.sin(dest.angle-Math.PI/2+(curveAngle*Math.PI/180));
                target2X = (dest.radius+5) * Math.cos(dest.angle-Math.PI/2-(curveAngle*Math.PI/180));
                target2Y = (dest.radius+5) * Math.sin(dest.angle-Math.PI/2-(curveAngle*Math.PI/180));

             //console.log("here..: ", d.src.radius * Math.cos(d.src.angle-Math.PI/2) , d.src.radius * Math.sin(d.src.angle-Math.PI/2));

                return "M" + source1X + "," + source1Y +
                    "Q" + controlPt1X + "," + controlPt1Y +
                    " " + target1X + "," + target1Y +
                    "M" + source2X + "," + source2Y +
                    "Q" + controlPt2X + "," + controlPt2Y +
                    " " + target2X + "," + target2Y;

            });
    }
    //----------------------------------------------------

    /*
     * radial
     */
    var radial = {};

    radial.el = function(el) {
      svgContainer = d3.select(el)
        .classed("radial", true)
        .append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

      svg = svgContainer.append("g")
        .attr('transform', 'translate('+WIDTH/2+','+HEIGHT/2+')');

      svg.append('g').attr('class', 'groups');
      svg.append('g').attr('class', 'routers');
      svg.append('g').attr('class', 'connectors');
      svg.append('g').attr('class', 'connections');
      svg.append('g').attr('class', 'greenLinks');
      svg.append('g').attr('class', 'greenLinksConnectors');

      return this;
    };

    radial.resize = function(w, h) {
      svgContainer.attr("width", w).attr("height", h);
      var r = Math.min(w,h)/2;
      svg.attr('transform', 'translate('+r+','+r+')');
      layout.size([w, h]);
      if (data) layout(data);
      render();
      return this;
    };

    radial.data = function(_) {
      if (!arguments.length) return data;
      data = _;
      layout(data);
      render();
      return this;
    };

    radial.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return this;
    };

    radial.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return this;
    };

    radial.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return this;
    };

    radial.filter = function() {
      if (data)
        filter();
      return this;
    };



    return radial;
  };
});