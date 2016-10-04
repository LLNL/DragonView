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

  return function(id_, doc, sims_) {
    var localDocument = doc || document;
    var root = d3.select(localDocument.body);
    var id = id_ || 'default';
    var sims = sims_;

    var width          = 220, height,
        svg,
        defaultCounter = 0, currentCounter = 0,
        filterRange    = [0, 0, true],
        run,
        knownRuns      = [],
        dataRange      = [0, 0],
        isSimulation   = true,
        frozen         = false,
        format         = d3.format('.5f');

    var cmap_yellow_pos = 50;

    var histogram = Histogram().counter(defaultCounter);
    var slider = Slider();

    var sim = root.select('#run')
      .on('change', function () {
        selectRun(this.value);
      }
    );

    var counters = root.select('#counter')
      .on('change', function () {
        selectCounter(this.value, false);
      }
    );

    var inout = true;

    root
      .on('keydown', function () {
        var options = root.select('#run');
        var value = +options.property('value');
        if (d3.event.keyCode == 38) {
          if (value > 0 && knownRuns[value - 1].name) {
            options.property('value', value - 1);
            selectRun(value - 1);
          } else {
            localDocument.getElementById('play').play();
          }
        } else if (d3.event.keyCode == 40) {
          if (value < knownRuns.length - 1 && knownRuns[value + 1].name) {
            options.property('value', value + 1);
            selectRun(value + 1);
          } else {
            localDocument.getElementById('play').play();
          }
        }
      }
    );

    root.select('#cmap')
      .style("width", "20px")
      .style("height", "135px")
      .style("position", "absolute")
      .style("left", "0px")
      .style('background-image', "linear-gradient(" + createColormap(cmap_yellow_pos) + ")")
      .on('mousedown', function () {
        d3.event.preventDefault();
        var self = this;
        root.select('#cmap')
          .on('mousemove', function () {
            updateCmap(1 - d3.mouse(this)[1] / 135); })
          .on('mouseup', function () {
            root.select('#cmap')
              .on('mousemove', null)
              .on('mouseup', null);
          }
        );
        updateCmap(cmap_yellow_pos / 100);
      }
    );


    root.select('#data-from')
      .style('left', '30px')
      .style('bottom', 0)
      .on('change', function () {
        updateCmap(1 - cmap_yellow_pos / 100);
        updateRange([+this.value, +root.select('#data-to').property('value')]);
        root.select('#data-reset').property('disabled', false);

      }
    );

    root.select('#data-mid')
      .style('left', '30px')
      .style('top', (135 / 2 - 10) + 'px')
      .on('change', function () {
        var min = +root.select('#data-from').property('value');
        var max = +root.select('#data-to').property('value');
        var f = (+this.value - min) / (max - min);
        updateCmap(f);
      }
    );

    root.select('#data-to')
      .style('left', '30px')
      .style('top', 0)
      .on('change', function () {
        updateCmap(1 - cmap_yellow_pos / 100);
        updateRange([+root.select('#data-from').property('value'), +this.value]);
        root.select('#data-reset').property('disabled', false);
      }
    );

    root.select('#data-reset').on('click', function () {
      root.select('#data-from').property('value', format(dataRange[0]));
      root.select('#data-to').property('value', format(dataRange[1]));
      updateCmap(0.5);
      updateRange(dataRange);
    }
    );

    root.select('#range-frozen').on('change', function () {
        frozen = this.checked;
        root.select('#data-reset').property('disabled', frozen);
      }
    );

    root.select('#inout').on('click', function () {
      inout = !inout;
      root.select('#inout').text(inout ? 'in' : 'out');
      histogram.mode(inout);
    }
  );

    Radio.channel(id).on('data.runsList', updateRunList);
    Radio.channel(id).on('data.run', newData);
    Radio.channel(id).on('app.ready', function () {
        if (!sims) {
          root.select('#catalog').text(DEFAULT_COLLECTION);
          dataService.loadCatalog(id, DEFAULT_COLLECTION);
        } else {
          root.select('#catalog').text(id);
          dataService.createCatalog(id, sims);
        }
      });

    root.select('#load')
      .on('click', function () {
        localDocument.getElementById('file').click();
      }
    );

    localDocument.getElementById('file').addEventListener("change", loadFile, false);

    var g = root.select('#info').append('g')
      .attr('class', 'info');

    g.call(histogram
        .width(width)
        .height(110)
    );

    histogram.on('brushed', onHighlight);

    var margin = histogram.margin();

    g.call(slider.width(width - margin.left - margin.right).extent([0, 1]))
      .select('.slider')
      .attr('transform', 'translate(' + (margin.left) + ',' + (histogram.height() + 5) + ')');

    slider.on('move', onZoom);

    // >> end of initialization

    function createColormap(pos) {
      return config.VALUES_COLORMAP.concat().reverse().map(function (v, i) { return i == 4 ? v + " " + pos + "%" : v }).toString();
    }

    function updateCmap(f) {
      cmap_yellow_pos = (1 - f) * 100;

      root.select('#cmap')
        .style('background-image', "linear-gradient(" + createColormap(cmap_yellow_pos) + ")");

      var min = +root.select('#data-from').property('value');
      var max = +root.select('#data-to').property('value');
      root.select('#data-mid').property('value', format(min + f * (max - min)));
      config.value_scale.domain([0, 1 - f, 1]);
      run.links.forEach(function (link) {
        link.vis_color = config.color(link.value);
      }
      );
      Radio.channel(id).trigger('cmap.changed');
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
        //.each(function (d) {
        //  if (!d.name)
        //    root.select(this).attr('disabled', true);})
        ;

      if (list.length > 0) dataService.load(id, list[0].name);
    }

    function selectRun(index) {
      if (knownRuns[index].name == 'other') {
        localDocument.getElementById('hidden-file-load').dispatchEvent(new Event('click'))
      } else {
        dataService.load(id, knownRuns[index].name);
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
      }
      );

      var names = [];
      if (isSimulation) {
        names = data.countersNames.concat();
        names.shift();
      }

      var sub = root.select('#sub').selectAll('label')
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
        }
        );
        if (min > max)  min = max;
        if (!frozen) {
          dataRange = [min, max];
          setRange(dataRange);
          root.select('#data-from').property('value', format(dataRange[0]));
          root.select('#data-to').property('value', format(dataRange[1]));
          updateCmap(cmap_yellow_pos / 100);
          root.select('#data-reset').property('disabled', true);

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
      }
      );
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
      run.links.forEach(function (link) {
        link.counters[0] += link.counters[index] * sign;
        link.total[0] += link.total[index] * sign;
      }
      );
      selectCounter(0, false);
      sum();
    }

    function sum() {
      var b = 0, g = 0, k = 0;
      var nb = 0, ng = 0, nk = 0;
      var value;

      run.links.forEach(function (link) {
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
      }
      );
      nb = nb || 1;
      ng = ng || 1;
      nk = nk || 1;
      var fmt = d3.format('4.3g');
      root.select('#vol-blues').text(fmt(b / nb));
      root.select('#vol-greens').text(fmt(g / ng));
      root.select('#vol-blacks').text(fmt(k / nk));
    }

    function updateRange(range) {
      filterRange = range;
      setRange(range);
      run.links.forEach(function (link) {
        link.value = link.counters[currentCounter];
        link.vis_color = config.color(link.value);
      }
      );
      histogram.range(slider.extent());
    }

    function selectCounter(index, isFrozen) {
      index = +index;
      currentCounter = index;
      root.select('#sub').selectAll('input').property('disabled', index != 0);

      if (!isSimulation && !isFrozen) {
        dataRange = counterRange(index);
        setRange(dataRange);
        root.select('#data-from').property('value', format(dataRange[0]));
        root.select('#data-to').property('value', format(dataRange[1]));
        root.select('#data-reset').property('disabled', true);
      }

      run.links.forEach(function (link) {
        link.value = link.counters[index];
        link.vis_color = config.color(link.value);
      }
      );

      histogram.counter(index);
      Radio.channel(id).trigger('counter.change', index);
      histogram.range(slider.extent());
    }

    function onZoom(size) {
      histogram.range(size);
    }

    function count(list, range) {
      var c = 0, i = -1, n = list.length, v, inside, mode = range[2];
      while (++i < n) {
        v = list[i].value;
        if (v == 0) continue;
        if (mode == (range[0] <= v && v <= range[1])) c++;  // note: '==' for (T & T) or (F & F)
      }
      return c;
    }

    function onHighlight(range) {
      console.log('highlight range:', range[0], range[1]);
      Radio.channel(id).trigger('counter.range', range);
      var b = count(run.blues, range), g = count(run.greens, range), k = count(run.blacks, range);
      root.select('#num-blues').text(b);
      root.select('#num-greens').text(g);
      root.select('#num-blacks').text(k);
      root.select('#filter-range').text((range[2] ? ' [in]: ' : ']out[: ') + format(range[0]) + '   ' + format(range[1])); //' min:'+format(size[0]) + ' max:'+format(size[1]));
      filterRange = range;
      sum();
    }

    function loadFile() {
      if (this.files.length > 0) {
        var file = this.files[0];
        root.select('#catalog').text(file.name);
        var reader = new FileReader();
        reader.onloadend = function (evt) {
          var dataUrl = evt.target.result;
          // The following call results in an "Access denied" error in IE.
          dataService.loadCatalog(id, dataUrl);
        };
        reader.readAsDataURL(file);
      }
    }


    var view = {};

    view.width = function (w) {
      if (!arguments.length) return width;
      width = w;
      return view;
    };

    view.height = function (h) {
      if (!arguments.length) return height;
      height = h;
      return view;
    };

    return view;
  }
});
