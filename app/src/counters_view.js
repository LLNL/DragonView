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
    Slider = require('svg/slider')
  ;

  var width = 200, height,
      svg, header,
      title="Counter",
      counterName = 'INQ_PRF_INCOMING_PKT_VC1_FILTER_FLIT1',
      counterIndex = 14;

  var histogram = Histogram();
  var slider = Slider();

  Radio.channel('data').on('change', function(run) {
    //var values = _.map(run.blues, function(d) { return d[counterIndex]; });

    var values = [];
    run.blues.forEach(function(d) { if (d.counters) values.push(d.counters[counterIndex]);})
    histogram.data(values);
    slider.domain([d3.min(values), d3.max(values)]);
  });


  function onZoom(from, to) {
    console.log('onZoom:',from, to);
    histogram.xdomain(from,  to);
  }

  function onHighlight(from, to) {
    Radio.channel('counter').trigger('range', [from, to]);
  }

  var view = function() {
    var g = d3.select('#counter').append('g')
      .attr('class', 'counter');

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