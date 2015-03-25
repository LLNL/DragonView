/**
 * Created by yarden on 12/16/14.
 */

define(function(require) {
  var
    d3 = require('d3');


  return function() {
    var
        margin = {top: 20, right:10, bottom: 10, left: 30},
        width = 200-margin.left-margin.right,
        height = 100 - margin.top - margin.bottom,
        dx = 5, duration = 500,
        svg, histogram, _series, handle,
        counterId = undefined,
        dispatch = d3.dispatch('brushed');

    var stack = d3.layout.stack();
    var x = d3.scale.linear()
      .domain([0, 1])
      .range([0, width]);

    var y = d3.scale.linear()
      .domain([0, 1])
      .rangeRound([height, 0]);

    var color = d3.scale.linear()
      .domain([0,2])
      .range( ['#4daf4a','#377eb8','#404040']);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(5)
      .tickFormat(d3.format('.02e'));

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(4);

    var brush = d3.svg.brush()
      .x(x)
      .on('brush', brushed);

    function brushed() {
      var e = brush.extent();
      //console.log('brush:',e[0], e[1]);
      dispatch.brushed(e[0], e[1]);
    }

    var colorAccessor = function(link) {
      return link.color;
    };

    function draw() {
      if (svg == undefined) return;

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

      handle = svg.append('g')
        .attr('class', 'brush')
        .call(brush);

      handle.selectAll('rect')
        .attr('height', height);

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

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
      return this;
    };

    var valueAccessor = function(link) {
      return link.counters[counterId];
    };

    api.data = function(series, domain) {
      _series = series;

      if (!domain) {
        var i = 0, n=_series.length;
        var min = Number.MAX_VALUE, max=0, value;
        if (n > 0) min = max = valueAccessor(_series[0]);
        while (++i < n) {
          value = valueAccessor(_series[i]);
          if (value > 0) {
            if (value < min) min = value;
            else if (value > max) max = value;
          }
        }
        domain = [min, max];
      }
      x.domain(domain);

      histogram = d3.layout.histogram()
          .range(x.domain())
          .value(valueAccessor)
          .bins(20)
        (_series);

      dx =  histogram.length > 1 ? x(histogram[1].x) - x(histogram[0].x)-1 : 5;

      y.domain([0, d3.max(histogram,  function(d) { return d.y;})]);
      draw();

      return this;
    };

    api.xdomain = function(d) {
      var save=duration; duration = 0;

      if (d[0] > 1000)
        xAxis.tickFormat(d3.format('.02e'));
      else
        xAxis.tickFormat(d3.format('g'));
      api.data(_series, d);
      svg.select('.brush').call(brush);
      brush.event(svg.select('.brush'));

      duration = save;

      return this;
    };

    api.on = function(type, listener) {
      dispatch.on(type, listener);
      return this;
    };

    return api;
  };

});