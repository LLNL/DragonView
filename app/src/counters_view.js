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
    Slider = require('svg/slider'),
    dataService = require('data');

  var DEFAULT_COLLECTION = 'data/runs-single.csv';

  var width = 250, height,
      svg, header,
      defaultCounter = 0,
      run,
      knownRuns = [],
      format = d3.format('.1e');


  var histogram = Histogram().counter(defaultCounter);
  var slider = Slider();

  var sim = d3.select('#run')
    .on('change', function() {
      selectRun(this.value);
    });

  var counters = d3.select('#counter')
    .on('change', function () {
      selectCounter(this.value);
    });

  Radio.channel('data').on('runsList', updateRunList);
  Radio.channel('data').on('run', newData);
  Radio.channel('app').on('ready', function() {
    d3.select('#catalog').text(DEFAULT_COLLECTION);
    dataService.loadCatalog(DEFAULT_COLLECTION);
  });

  function updateRunList(list) {
    knownRuns = list;
    var options = sim.selectAll('option')
          .data(knownRuns, function(d) { return d.name;});

    options.enter()
        .append('option');

    options.attr('value', function (d, i) { return i; })
          .text(function (d) { return d.name; });

    options.exit().remove();

    if (list.length > 0) dataService.load(list[0].name);
  }

  function selectRun(index) {
    if (knownRuns[index].name == 'other') {
      document.getElementById('hidden-file-load').dispatchEvent(new Event('click'))
    } else {
      dataService.load(knownRuns[index].name);
    }
  }

  function newData(data) {
    run = data;

    /* list of counters */
    var options = counters.selectAll('option')
      .data(run.countersNames);

    options.enter().append('option');

    options
      .attr('value', function (d, i) { return i; })
      .text(function (d) { return d; });

    options.exit().remove();

    counters.property("value", defaultCounter);

    var values = [];
    run.links.forEach(function (link) {
      values.push(link);
    });

    histogram.data(values);
    selectCounter(defaultCounter);
  }

  function selectCounter(index) {
    var min = Number.MAX_VALUE, max=0, value;
    run.links.forEach(function(link) {
      value = link.counters[index];
      if (value > 0) {
        if (value < min) min = value;
        if (value > max) max = value;
      }
    });

    histogram.counter(index).range([min,  max]);
    slider.domain([min,  max]);
    Radio.channel('counter').trigger('change', index);
  }


  function onZoom(from, to) {
    histogram.range([from,  to]);
  }

  function onHighlight(from, to) {
    Radio.channel('counter').trigger('range', [from, to]);
  }

  function loadFile() {
    if (this.files.length > 0) {
      var file = this.files[0];
      d3.select('#catalog').text(file.name);
      var reader = new FileReader();
      reader.onloadend = function(evt) {
        var dataUrl = evt.target.result;
        // The following call results in an "Access denied" error in IE.
        dataService.loadCatalog(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  var view = function() {

    d3.select('#load')
      .on('click', function(){  document.getElementById('file').click(); });

    document.getElementById('file')
      .addEventListener("change", loadFile, false);

    d3.select('file').on('change', function() {
      console.log('loaded');
    });

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