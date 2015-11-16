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

  var DEFAULT_COLLECTION = 'data/runs-4jobs-1.csv';

  var width = 220, height,
      svg,
      defaultCounter = 0, currentCounter = 0,
      filterRange = [0, 0, true],
      run,
      knownRuns = [],
      dataRange = [0,0],
      isSimulation = true,
      frozen = false,
      format = d3.format('.5f');

  var cmap_yellow_pos = 50;

  var histogram = Histogram().counter(defaultCounter);
  var slider = Slider();

  var sim = d3.select('#run')
    .on('change', function() {
      selectRun(this.value);
    });

  d3.select('body')
    .on('keydown', function() {
      var options = d3.select('#run');
      var value = +options.property('value');
      if (d3.event.keyCode == 38) {
        if (value> 0 && knownRuns[value-1].name) {
          options.property('value', value - 1);
          selectRun(value - 1);
        } else {
          document.getElementById('play').play();
        }
      } else if (d3.event.keyCode == 40) {
          if (value < knownRuns.length-1 && knownRuns[value+1].name) {
          options.property('value', value+1);
          selectRun(value+1);
        } else {
            document.getElementById('play').play();
          }
      }
    });

  var counters = d3.select('#counter')
    .on('change', function () {
      selectCounter(this.value, false);
    });


  d3.select('#cmap')
    .style("width", "20px")
    .style("height", "135px")
    .style("position", "absolute")
    .style("left", "0px")
    .style('background-image', "linear-gradient("+createColormap(cmap_yellow_pos)+")")
    .on('mousedown', function() {
      d3.event.preventDefault();
      d3.select(this)
        .on('mousemove', function() { d3.select('#data-reset').property('disabled', false);
          updateCmap(1-d3.mouse(this)[1]/135);
        })
        .on('mouseup', function() {
          d3.select(this)
            .on('mousemove', null)
            .on('mouseup', null);
        });
      updateCmap(cmap_yellow_pos/100);
    });


  d3.select('#data-from')
    .style('left', '30px')
    .style('bottom', 0)
    .on('change', function() {
      updateCmap(1-cmap_yellow_pos/100);
      updateRange([+this.value, +d3.select('#data-to').property('value')]);
      d3.select('#data-reset').property('disabled', false);

    });

  d3.select('#data-mid')
    .style('left', '30px')
    .style('top', (135/2-10)+'px')
    .on('change', function() {
      var min = +d3.select('#data-from').property('value');
      var max = +d3.select('#data-to').property('value');
      var f = (+this.value - min)/(max - min);
      d3.select('#data-reset').property('disabled', false);
      updateCmap(f);
    });

  d3.select('#data-to')
    .style('left', '30px')
    .style('top', 0)
    .on('change', function() {
      updateCmap(1-cmap_yellow_pos/100);
      updateRange([+d3.select('#data-from').property('value'),+this.value]);
      d3.select('#data-reset').property('disabled', false);
    });

  d3.select('#data-reset').on('click', function() {
    d3.select('#data-from').property('value', format(dataRange[0]));
    d3.select('#data-to').property('value', format(dataRange[1]));
    updateCmap(0.5);
    updateRange(dataRange);
  });

  d3.select('#range-frozen').on('change', function() {
    frozen = this.checked;
    d3.select('#data-reset').property('disabled', frozen);
  });

  var inout = true;
  d3.select('#inout').on('click', function() {
      inout = !inout;
    d3.select(this).text(inout ? 'in' : 'out');
    histogram.mode(inout);
  });

  Radio.channel('data').on('runsList', updateRunList);
  Radio.channel('data').on('run', newData);
  Radio.channel('app').on('ready', function() {
    d3.select('#catalog').text(DEFAULT_COLLECTION);
    dataService.loadCatalog(DEFAULT_COLLECTION);
  });

  function createColormap(pos) {
    return config.VALUES_COLORMAP.concat().reverse().map( function(v, i) { return i==4 ? v + " "+pos+"%" : v }).toString();
  }

  function updateCmap(f) {
    cmap_yellow_pos = (1-f) * 100;

    d3.select('#cmap')
      .style('background-image', "linear-gradient("+createColormap(cmap_yellow_pos)+")");

    var min = +d3.select('#data-from').property('value');
    var max = +d3.select('#data-to').property('value');
    d3.select('#data-mid').property('value', format(min+f*(max-min)));
    config.value_scale.domain([0, 1-f, 1 ]);
    run.links.forEach(function(link) {
      link.vis_color = config.color(link.value);
    });
    Radio.channel('cmap').trigger('changed');
  }

  function updateRunList(list) {
    knownRuns = list;
    sim.selectAll('option').remove();

    var options = sim.selectAll('option')
          .data(knownRuns);

    options.enter()
        .append('option')
        .attr('value', function (d, i) { return i; })
          .text(function (d) { return d.name || "──────────"; })
          .each(function(d) { if (!d.name) d3.select(this).attr('disabled', true);});

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
    isSimulation = run.countersNames[0] == 'bytes';
    /* list of counters */
    var options = counters.selectAll('option')
      .data(run.countersNames);

    options.enter().append('option');

    options
      .attr('value', function (d, i) { return i; })
      .text(function (d) { return d; });

    options.exit().remove();

    var links = [];
    run.links.forEach(function (link) {
      links.push(link);
    });

    var names = [];
    if (isSimulation) {
      names = data.countersNames.concat();
      names.shift();
    }

    var sub = d3.select('#sub').selectAll('label')
      .data(names, function (d) { return d; });

    sub.enter()
      .append('label')
      .attr('class', 'sub-label')
      .style('display', 'inline-block')
      .text(function (d) { return d;})
      .append('input')
      .attr('type', 'checkbox')
      .attr('value', function (d, i) { return i + 1;})
      .on('change', function () { subtract(+this.value, this.checked) });

    sub.selectAll('input').property('checked', true);

    sub.exit().remove();

    histogram.data(links);

    var index = currentCounterName == data.countersNames[currentCounter] ? currentCounter : defaultCounter;
    counters.property("value", index);

    if (isSimulation) {
      var min = Number.MAX_VALUE, max = 0, n, i, v;
      run.links.forEach(function (link) {
        n = link.counters.length;
        i = -1;
        while (++i < n) {
          v = link.counters[i];
          if (v < min && v > 0) min = v;
          if (v > max) max = v;
        }
      });
      if (min > max)  min = max;
      if (!frozen) {
        dataRange = [min, max];
        setRange(dataRange);
        d3.select('#data-from').property('value', format(dataRange[0]));
        d3.select('#data-to').property('value', format(dataRange[1]));
        updateCmap(cmap_yellow_pos/100);
        d3.select('#data-reset').property('disabled', true);

      }
      sum();
    }
    selectCounter(index, frozen);
  }

  function counterRange(idx) {
    var min = Number.MAX_VALUE, max = 0, n, i, v;
    run.links.forEach(function (link) {
      link.value = link.counters[idx];
      if (link.value > 0) {
        if (link.value < min && link.value > 0) min = link.value;
        if (link.value > max) max = link.value;
      }
    });
    return [min, max];
  }

  function setRange(range) {
    config.data_range(range);
    slider.domain(range);
    histogram.range(range);
    if (range[1] < 100) format = d3.format('5.2f');
    else if (range[1] < 100000) format = d3.format('7.1f');
    else format = d3.format('.2e');
  }

  function subtract(index, on) {
    var sign = on ? 1 : -1;
    run.links.forEach(function(link) {
      link.counters[0] += link.counters[index]*sign;
      link.total[0] += link.total[index]*sign;
    });
    selectCounter(0, false);
    sum();
  }

  function sum() {
    var b = 0, g = 0, k = 0;
    var nb = 0, ng = 0, nk = 0;
    var value;
    //run.links.forEach(function(link) {
    //  if (link.value >= filterRange[0] && link.value <= filterRange[1]) {
    //    value = link.value; //link.total[currentCounter];
    //    if (link.color == 'b') {
    //      b += value;
    //      //nb += link.n;
    //      nb++;
    //    }
    //    else if (link.color == 'g') {
    //      g += value;
    //      //ng += link.n;
    //      ng++;
    //    }
    //    else {
    //      k += value;
    //      //nk += link.n;
    //      nk++;
    //    }
    //  }
    //});
    run.links.forEach(function(link) {
      value = link.total[currentCounter];
      if (value > 0) {
        if (link.color == 'b') {
          b += value;
          nb += link.n;
        }
        else if (link.color == 'g') {
          g += value;
          ng += link.n;
        }
        else {
          k += value;
          nk += link.n;
        }
      }
    });
    nb = nb || 1;
    ng = ng || 1;
    nk = nk || 1;
    var fmt = d3.format('4.3g');
    d3.select('#vol-blues').text(fmt(b/nb));
    d3.select('#vol-greens').text(fmt(g/ng));
    d3.select('#vol-blacks').text(fmt(k/nk));
    //console.log('vol:',nb, b, ng, g, nk, k);
  }

  function updateRange(range) {
    filterRange = range;
    setRange(range);
    run.links.forEach(function(link) {
      link.value = link.counters[currentCounter];
      link.vis_color = config.color(link.value);
    });
    histogram.range(slider.extent());
  }

  function selectCounter(index, isFrozen) {
    index = +index;
    currentCounter = index;
    d3.select('#sub').selectAll('input').property('disabled', index!=0);

    if (!isSimulation && !isFrozen) {
      dataRange = counterRange(index);
      setRange(dataRange);
      d3.select('#data-from').property('value', format(dataRange[0]));
      d3.select('#data-to').property('value', format(dataRange[1]));
      d3.select('#data-reset').property('disabled', true);
    }

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
    var c = 0, i=-1, n = list.length, v, inside, mode = range[2];
    while (++i < n) {
      v = list[i].value;
      if (v == 0) continue;
      if (mode == (range[0] <= v  && v <= range[1])) c++;  // note: '==' for (T & T) or (F & F)
    }
    return c;
  }

  function onHighlight(range) {
    Radio.channel('counter').trigger('range', range);
    var b = count(run.blues, range), g = count(run.greens, range), k = count(run.blacks, range);
    d3.select('#num-blues').text(b);
    d3.select('#num-greens').text(g);
    d3.select('#num-blacks').text(k);
    d3.select('#filter-range').text((range[2]? ' [in]: ' : ']out[: ') +format(range[0])+ '   ' +format(range[1])); //' min:'+format(size[0]) + ' max:'+format(size[1]));
    filterRange = range;
    sum();
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
      .height(110));

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
