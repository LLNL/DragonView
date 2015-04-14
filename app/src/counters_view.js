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
    dataService = require('data'),
    config = require('config');

  var DEFAULT_COLLECTION = 'data/runs-single.csv';

  var width = 250, height,
      svg, header,
      defaultCounter = 0, currentCounter = 0,
      run,
      knownRuns = [],
      format = d3.format('.5f');


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
    sim.selectAll('option').remove();

    var options = sim.selectAll('option')
          .data(knownRuns); //, function(d) { return d.name;});

    options.enter()
        .append('option')
        .attr('value', function (d, i) { return i; })
          .text(function (d) { return d.name || "──────────"; })
          .each(function(d) { if (!d.name) d3.select(this).attr('disabled', true);});
          //.attr('disabled', function(d) {return d.name == undefined;} );

    //options.exit().remove();

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
    var currentCounterName = run && run.countersNames[currentCounter];

    run = data;

    /* list of counters */
    var options = counters.selectAll('option')
      .data(run.countersNames);

    options.enter().append('option');

    options
      .attr('value', function (d, i) { return i; })
      .text(function (d) { return d; });

    options.exit().remove();

    var links = [];
    run.links.forEach(function(link) {
      links.push(link);
    });

    var names = data.countersNames.concat();
    names.shift();

    var sub = d3.select('#sub').selectAll('label')
      .data(names, function(d) { return d; });

    sub.enter()
      .append('label')
      .style('display', 'inline-block')
      .text(function(d) { return d;})
      .append('input')
      .attr('type', 'checkbox')
      .attr('value', function(d, i) { return i+1;})
      .on('change', function() { subtract(+this.value, this.checked) });

    sub.selectAll('input').property('checked', true);

    sub.exit().remove();

    histogram.data(links);

    var index = currentCounterName == data.countersNames[currentCounter] ? currentCounter : defaultCounter;
    counters.property("value", index);

    var min = Number.MAX_VALUE, max=0, n, i, v;
    run.links.forEach(function(link) {
      link.value = link.counters[0];
      n = link.counters.length;
      i = -1;
      while (++i<n) {
        v = link.counters[i];
        if (v < min && v > 0) min = v;
        if (v > max) max = v;
      }
    });
    console.log('range:', min, max);
    if (min > max)  min = max;

    d3.select('#data-range').text(' '+format(min)+', '+format(max)); // format(min) + ' max:'+format(max));
    config.data_range([min, max]);
    slider.domain([min,  max]);
    selectCounter(index);
  }

  function min0(current, list) {
    var n = list.len
  }
  function subtract(index, on) {
    var sign = on ? 1 : -1;
    run.links.forEach(function(link) {
      link.counters[0] += link.counters[index]*sign;
    });
    selectCounter(0);
  }

  function selectCounter(index) {
    console.log('select index:', index);
    index = +index;
    currentCounter = index;
    d3.select('#sub').selectAll('input').property('disabled', index!=0);


    run.links.forEach(function(link) {
      link.value = link.counters[index];
      link.vis_color = config.color(link.value);
    });

    histogram.counter(index);
    Radio.channel('counter').trigger('change', index);
    histogram.range(slider.extent());
  }


  function onZoom(size) {
    histogram.range(size);
  }

  function count(list, range) {
    var c = 0, i=-1, n = list.length;
    while (++i < n) {
      if (range[0] <= list[i].value  && list[i].value <= range[1]) c++;
    }
    return c;
  }
  function onHighlight(size) {
    Radio.channel('counter').trigger('range', size);
    var b = count(run.blues, size), g = count(run.greens, size), k = count(run.blacks, size);
    d3.select('#selection').text('blue:'+b+' green:'+g+' black:'+k);
    d3.select('#filter-range').text(' '+format(size[0])+', '+format(size[1])); //' min:'+format(size[0]) + ' max:'+format(size[1]));
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

    document.getElementById('file').addEventListener("change", loadFile, false);

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