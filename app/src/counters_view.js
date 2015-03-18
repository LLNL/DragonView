/**
 * Created by yarden on 12/20/14.
 */

define(function(require) {
  var
    $ = require('jquery'),
    _ = require('underscore'),
    Radio = require('radio'),
    d3 = require('d3'),
    Histogram = require('svg/histogram'),
    Slider = require('svg/slider'),
    d = require('data');
  ;

  var width = 200, height,
      svg, header,
      defaultCounter = 0,
      run,
      format = d3.format('.2e');

  var histogram = Histogram();
  var slider = Slider();

  Radio.channel('data').on('change', function(data) {
    run = data;

    var counters = d3.select('#counter')
      .on('change', function () {
        selectCounter(this.value);
      });

    var options = counters.selectAll('option')
      .data(run.countersNames);

    options.enter()
      .append('option')
      .attr('value', function (d, i) { return i; })
      .text(function (d) { return d; });

    counters.property("value", defaultCounter);
    selectCounter(defaultCounter);

    options.exit().remove();
  });

  function selectCounter(index) {
    var values = [];
    run.links.forEach(function (d) {
      if (d.counters) values.push(d.counters[index]);
    });
    histogram.data(values);
    slider.domain([d3.min(values), d3.max(values)]);
    Radio.channel('counter').trigger('change', index);
  }


  function onZoom(from, to) {
    console.log('onZoom:',format(from), format(to));
    histogram.xdomain(from,  to);
  }

  function onHighlight(from, to) {
    console.log('highlight:', format(from),  format(to));
    Radio.channel('counter').trigger('range', [from, to]);
  }

  var view = function() {

    var g = d3.select('#info').append('g')
      .attr('class', 'info');

    g.call(histogram
      .width(width)
      .height(100));

    histogram.on('brushed', onHighlight);

    var margin = histogram.margin();

    g.call(slider.width(width-margin.left-margin.right).extent([0, 1]))
      .select('.slider')
      .attr('transform', 'translate(' + (margin.left) +  ',' + (histogram.height()+5) + ')');

    slider.on('move', onZoom);
  };

  view.width = function(w) {
    if (!arguments.length) return width;
    width = w;
    return view;
  };

  view.height = function(h) {
    if (!arguments.length) return height;
    height = h;
    return view;
  };

  return view;
});