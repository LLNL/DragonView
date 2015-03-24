/**
 * Created by yarden on 12/20/14.
 */

define(function(require) {
  var
    _ = require('underscore'),
    $ = require('jquery'),
    Radio = require('radio'),
    d3 = require('d3'),
    Histogram = require('svg/histogram_g'),
    Slider = require('svg/slider');
    //d = require('data');

  var width = 200, height,
      svg, header,
      defaultCounter = 0,
      run,
      knownRuns = [' ', 'other'],
      format = d3.format('.1e');

  var histogram = Histogram().counter(defaultCounter);
  var slider = Slider();

  Radio.channel('data').on('change', function(data) {
    run = data;

    var sim = d3.select('#run')
      .on('change', function() {
        selectRun(this.value);
      });

    sim.selectAll('option')
      .data(knownRuns)
      .enter()
        .append('option')
        .attr('value', function (d, i) { return i; })
        .text(function (d) { return d; });

    d3.select("#hidden-file-load")
      .on('change', function() {
        console.log('load file args:', arguments);
      });


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

    var values = [];
    run.links.forEach(function (link) {
      if (link.counters) values.push(link);
    });
    histogram.data(values);
    selectCounter(defaultCounter);

    options.exit().remove();
  });

  function selectRun(index) {
    if (knownRuns[index] == 'other') {
      document.getElementById('hidden-file-load').dispatchEvent(new Event('click'))
      //elem.click();
      //$("#hidden-file-load").;
      //var elem = d3.select('#file');
      //elem.on('click').call(elem.node(), elem.datum());
    } else {
      console.log('select run', index);
    }
  }

  function selectCounter(index) {
    histogram.counter(index);

    var min = Number.MAX_VALUE, max=0, value;
    run.links.forEach(function(link) {
      if (link.counters) {
        value = link.counters[index];
        if (value > 0) {
          if (value < min) min = value;
          else if (value > max) max = value;
        }
      }
    });

    slider.domain([min,  max]);
    Radio.channel('counter').trigger('change', index);
  }


  function onZoom(from, to) {
    //console.log('onZoom:',format(from), format(to));
    histogram.xdomain([from,  to]);
  }

  function onHighlight(from, to) {
    //console.log('highlight:', format(from),  format(to));
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