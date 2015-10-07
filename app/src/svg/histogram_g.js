/**
 * Created by yarden on 12/16/14.
 */

define(function(require) {
  var
    d3 = require('d3');


  return function() {
    var
        margin = {top: 20, right:10, bottom: 10, left: 40},

        width = 250-margin.left-margin.right,
        height = 150 - margin.top - margin.bottom,
        dx = 5, duration = 500,
        svg, histogram, _series, handle,
        counterId = undefined,
        percentile = undefined,
        dispatch = d3.dispatch('brushed');

    var insideMode = true;
    var leftHandle, rightHandle;

    var stack = d3.layout.stack();
    var x = d3.scale.linear()
      .domain([0, 1])
      .range([0, width])
      .clamp(true);

    var y = d3.scale.linear()
      .domain([0, 1])
      .rangeRound([height, 0]);

    var color = d3.scale.linear()
      .domain([0,2])
      .range( ['#4daf4a','#377eb8','#404040']);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(4)
      .tickFormat(d3.format('4g'));

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(4)
      .tickFormat(d3.format('4g'));

    var brush = d3.svg.brush()
      .x(x)
      .on('brush', brushed);

    function brushed() {
      var e = brush.extent();
      if (!insideMode) {
        leftHandle.attr('width', x(e[0]));
        var r = x(e[1]);
        rightHandle.attr('x', r).attr('width', width-r);
      }
      dispatch.brushed([e[0], e[1], insideMode]);
    }

    var colorAccessor = function(link) {
      return link.color;
    };

    function draw() {
      if (svg == undefined) return;

      if (!percentile) {
        var values = _series.map(valueAccessor).sort(d3.ascending);
        var l = values.length;
        percentile = [values[l/4], values[l/2], values[l*3/4]];
        console.log('percentile:', percentile);
      }
      svg.select('.x')
        .call(xAxis);

      svg.select('.y')
        .call(yAxis);

      var colors = {g:'green', k:'black', b:'steelblue'};
      var bars = [];
      histogram.forEach(function(bin, idx) {
        var i=-1, n = bin.length, counts = {g:0, k:0, b:0};
        while( ++i<n) { counts[colorAccessor(bin[i])]++; }
        var y0 = 0, y1=0;
        for (var key in counts) {
          y0 = y1; y1 += counts[key];
          bars.push({id: key+idx, x: bin.x, y0: y0, y1: y1, color: colors[key]});
        }
      });

      var bar = svg.selectAll('.bar')
        .data(bars, function (d) { return d.id; });

      var enter = bar.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', height)
        .attr('height', 0)
        .attr('fill', function(d) { return d.color; });

      bar
        .attr('x', function (d) { return x(d.x); })
        .attr('width', dx)
        .transition()
        .duration(duration)
          .attr('y', function (d) { return y(d.y1); })
          .attr('height', function (d) { return y(d.y0) - y(d.y1) ; });

      bar.exit()
        .remove();

      //svg.select('.percentile rect')
      //  .attr('x', x(percentile[0]))
      //  .attr('width', x(percentile[2])-x(percentile[0]));

      var lx = percentile.map(x);
      var lines = [
        {x1: lx[0], x2: lx[0], y1: 0, y2: -6, visible: lx[0] > 0 && lx[0] < width},
        {x1: lx[1], x2: lx[1], y1: 0, y2: -6, visible: lx[1] > 0 && lx[1] < width},
        {x1: lx[2], x2: lx[2], y1: 0, y2: -6, visible: lx[2] > 0 && lx[2] < width},
        {x1: lx[0], x2: lx[2], y1: -2.5, y2: -2.5, visible: true}
      ];

      var line = svg.select('.percentile').selectAll('line')
        .data(lines);

      line.enter()
        .append('line')
        .style('stroke', 'black')
        .style('stroke-width', '1')
        .style('shape-rendering', 'crispEdges');

      line
        .attr('x1', function(d) { return d.x1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y1', function(d) { return d.y1; })
        .attr('y2', function(d) { return d.y2; })
        .attr('visibility', function(d) { return d.visible && 'visible' || 'hidden'; });

    }

    function api(selection) {
      svg = selection.append('g')
        .attr('class', 'histogram')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.append('g')
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'steelblue')
        .style('opacity', 0.0);

      var p = svg.append('g')
        .attr('class', 'percentile');

      //p.append('rect')
      //  .attr('x', x(0))
      //  .attr('y', -5)
      //  .attr('height', 5)
      //  .attr('width', 0)
      //  .attr('fill', 'orange');

      //p.append('line')
      //  .attr('x1', 0)
      //  .attr('x2', 0)
      //  .attr('y1', 0)
      //  .attr('y2', -5)
      //  .style('stroke', 'black')
      //  .style('stroke-width', 1);

      handle = svg.append('g')
        .attr('class', 'brush')
        .call(brush);

      leftHandle = svg.append('rect')
        .attr('class', 'externalHandler')
        .attr('width', 0)
        .attr('height', height);

      rightHandle = svg.append('rect')
        .attr('class', 'externalHandler')
        .attr('width', 0)
        .attr('height', height)
        .attr('x', width);

      handle.selectAll('rect')
        .attr('height', height);

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

      brush.clear();
      return this;
    }

    api.width = function(w) {
      if (!arguments.length) return width + margin.left + margin.right;
      width = w - margin.left - margin.right;
      x.range([0, width]);

      draw();
      return this;
    };

    api.height = function(h) {
      if (!arguments.length) return height + margin.top + margin.bottom;
      height = h - margin.top - margin.bottom;
      y.rangeRound([height, 0]);
      yAxis.ticks( Math.max(2, height/50));
      if (handle) {
        handle.selectAll('rect')
          .attr('height', height);
      }

      draw();
      return this;
    };

    api.margin = function(m) {
      if (!arguments.length) return margin;
      svg.attr('translate', 'transform(' + (m.left - margin.left) + ',' + (m.top - margin.top) + ')');
      margin = m;
      return api;
    };

    api.counter = function(id) {
      counterId = id;
      percentile = undefined;
      return this;
    };

    var valueAccessor = function(link) {
      return link.counters[counterId];
    };

    api.data = function(series, domain) {
      _series = series;
      percentile = undefined;
      return this;
    };

    api.range = function(range) {
      var save=duration; duration = 0;

      var extent = brush.extent();

      x.domain(range);

      histogram = d3.layout.histogram()
        .range(x.domain())
        .value(valueAccessor)
        .bins(20)
      (_series);

      dx =  histogram.length > 1 ? x(histogram[1].x) - x(histogram[0].x)-1 : 5;

      y.domain([0, d3.max(histogram,  function(d) { return d.y;})]);
      draw();

      if (!brush.empty()) {
        //extent = [Math.min(Math.max(extent[0], range[0]), range[1]), Math.max(Math.min(extent[1], range[1]), range[0])];
        //brush.extent(extent);
        svg.select('.brush').call(brush);
        brush.event(svg.select('.brush'));
      }
      duration = save;
      return this;
    };

    api.mode = function(on) {
      insideMode = on;
      if (insideMode) {
        leftHandle.attr('x', 0).attr('width', 0);
        rightHandle.attr('x', width).attr('width', 0);
        svg.select('.brush .extent').style('opacity', 1);
      } else {
        var e = brush.extent();
        var r = x(e[1]);
        leftHandle.attr('width', x(e[0]));
        rightHandle.attr('x', r).attr('width', width-r);
        svg.select('.brush .extent').style('opacity', 0);
      }
      svg.select('.brush').call(brush);
      brushed();
    };

    api.on = function(type, listener) {
      dispatch.on(type, listener);
      return this;
    };

    return api;
  };

});