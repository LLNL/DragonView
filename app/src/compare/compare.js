/**
 * Created by yarden on 11/10/15.
 */

define(function(require) {

  var d3 = require('d3');
  var spec = require('config');

  var localWindow = null;
  var root = null;
  var data = null;
  var active = [];
  var mat;
  var valueSelector = 'min';
  var spec;

  var fields = {
    config:  {name: 'config',  type: 'category', values: [], sort: d3.ascending, selected: new Set()},
    dataset: {name: 'dataset', type: 'category', values: [], sort: d3.ascending, selected: new Set()},
    sim:     {name: 'sim',     type: 'category', values: [], sort: simSort, selected: new Set()},
    jobid:   {name: 'jobid',   type: 'category', values: [], sort: d3.ascending, selected: new Set()},
    color:   {name: 'color',   type: 'fixed', values: ['r', 'g', 'k', 'b'], selected: new Set(['r', 'g', 'k', 'b'])}
  };

  var filterValues = {};

  var VALUES_COLORMAP =["#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027"];
  var value_scale = d3.scale.linear().domain([0, 0.5, 1]).range([0, 0.5, 1]);
  var scale = d3.scale.quantize().range(VALUES_COLORMAP);
  function color(v) { return scale(value_scale(v)); }

  var options = ['config / jobid', 'sim / dataset,jobid', 'config,dataset,sim / color,jobid'];

  var colorname = ['r', 'g', 'k', 'b'];

  function simSort(a,b) {
    a = +a.slice(3);
    b = +b.slice(3);
    return a -b;
  }

  // launch button on the main page
  d3.select('#show-compare')
    .on('click', function() {
      if (localWindow == null || localWindow.closed) {
        localWindow = window.open('compare.html', 'compare');
        d3.select(localWindow).on('load', init);
      }
      else {
        localWindow.focus();
      }
    });


  // init module only it is actually called
  function init() {
    root = localWindow.document.body;

    d3.select(root).select('#select-options')
      .on('change', function (d) { select(d3.select(this).property('selectedIndex')); })
      .selectAll('option')
      .data(options)
      .enter()
        .append('option')
        .attr('value', function(d) {return d;})
        .text(function(d) { return d;});

    d3.csv('data/alldata.csv')
      .row(function(d) {
        d.jobid = +d.jobid;
        d.color = colorname[d.color];
        d.min = +d.min;
        d.avg = +d.avg;
        d.max = +d.max;
        d.nonzero = +d.nonzero;
        d.navg = +d.navg;
        return d;
      })
      .get(function(error, rows) {
        if (error) {
          // TODO: better error message notification
          console.err(error);
        }
        else {
          d3.select(root).select('#size').text(rows.length);
          if (rows.length == 0) {
            // TODO: better message notification
            console.log('empty dataset');
            return;
          }
          data = rows;

          // TODO: use keys based on data. Issue: how to determine which fields are values
          var keys = ['min', 'avg', 'max', 'nzavg'];

          d3.select(root).select('#select-values')
            .on('change', selectValue)
            .selectAll('option')
            .data(keys)
            .enter()
              .append('option')

            .attr('value', function(d) {return d;})
            .text(function(d) { return d;});

          // init selection and render
          valueSelector = 'max';
          d3.select(root).select('#select-values')
            .property('value', valueSelector);

          setupFields();
          select(0);
          filter();
        }
      });
  }

  function setupFields() {
    collectValues(data);

    var li = d3.select(root).select('#info #fields').selectAll('li')
      .data(Object.keys(fields))
      .enter()
      .append('li');

    li.append('label')
      .attr('class', 'li-title')
      .text(function(d) {return d;});

    var entry = li.append('ul')
      .attr('class', 'values')
      .selectAll('li')
      .data(function(d) { return fields[d].values.map(function(v) { return [fields[d].name, v];});})
      .enter()
        .append('li')
        .attr('class', 'value');


    entry
      .append('input')
      .attr('type', 'checkbox')
      .property('name', function(d) {return d[0];})
      .property('value', function(d) { return d[1]; })
      .property('checked', true)
      .on('change', function(d) {
        var set = fields[d3.select(this).property('name')].selected;
        if (d3.select(this).property('checked')) set.add(d[1]);
        else set.delete(d[1]);
        filter();
      });

    entry
      .append('text')
      .text(function(d) { return d[1]});
  }

  function collectValues(rows) {
    var field;
    Object.keys(fields).forEach(function(field) {
      if (fields[field].type == 'category') {
        var set = new Set();
        rows.forEach(function(row) {
          set.add(row[field]);
        });
        fields[field].values = Array.from(set).sort(fields[field].sort);
        fields[field].selected = new Set(fields[field].values);
      }
    });
  }

  function adjustColormap() {
    var max = d3.max(mat.values, function (d) { return d.values[valueSelector]; });
    value_scale.domain([0, max/2, max]);
  }

  function filter() {
    var keys = Object.keys(fields);
    var i, n = keys.length, key;
    active = data.filter(function(row) {
      for (i=0; i<n; i++) {
        key = keys[i];
        if (!fields[key].selected.has(row[key])) return false;
      }
      return true;
    });
    recompute();
  }

  function selectValue() {
    valueSelector = d3.select(this).property('value');
    adjustColormap();
    render(mat);
  }

  function select(opt) {
    if (opt == 0) {
      spec = {
        rows: [fields.config],
        cols: [fields.jobid]
        //filter: function(d) { return d.dataset == '8jobs-1' && d.config == 'default' && d.sim == 'sim1'}
      };
    }
    else if (opt == 1) {
      spec = {
        rows: [fields.config, fields.sim],
        cols: [fields.dataset, fields.jobid]
        //filter: function(d) { return d.dataset == '8jobs-1' && d.config == 'default'; }
      };
    }
    else if (opt == 2) {
      spec = {
        rows: [fields.config, fields.dataset, fields.sim],
        cols: [fields.color, fields.jobid]
        //filter: function(d) { return d.dataset == '4jobs-1' || d.dataset == '4jobs-2'}
      };
    }
    recompute();
  }

  function recompute() {
    mat = collect(spec,  aggregate(spec));
    adjustColormap();
    render(mat);
  }

  function aggregate(spec) {
    //var active = spec.filter && data.filter(spec.filter) || data;

    var nest = d3.nest();
    spec.rows.forEach(function(field) { nest.key(function(d) { return d[field.name];}); } );
    spec.cols.forEach(function(field) { nest.key(function(d) { return d[field.name];}); } );

    return nest.rollup(function(leaves) { return {
        min: d3.min(leaves, function(d) { return d.min; }),
        avg: d3.mean(leaves, function(d) { return d.avg; }),
        max: d3.max(leaves, function(d) { return d.max; }),
        nonzero: d3.max(leaves, function(d) { return d.nonzero; }),
        nzavg: d3.sum(leaves, function(d) { return d.nzavg * d.nonzero; })/ d3.sum(leaves, function(d) { return d.nonzero; })
      }})
      .entries(active);
  }

  var x0 = 20, y0 = 40;
  var dx = 1, dy = 1;
  var w = 15, h = 15;
  var fontSize = 15;
  var lastRowWidth = 30;
  var x, y;

  function collect(spec, nodes) {
    x = x0;
    y = y0;
    var mat = {header: {rows:[], cols:[]}, values:[]};
    var collect_col_headers = true;
    var max_value = 0;

    visit(spec.rows.length, spec.cols.length, nodes);
    return mat;

    function visit(nrows, ncols, nodes) {
      var i, n, node, nr = spec.rows.length, nc = spec.cols.length;
      if (nrows > 0) {
        for (i=0, n=nodes.length; i<n; i++) {
          node = nodes[i];
          node.label = node.key;
          node.x = x;
          node.y = y;
          x += +dx + (nrows == 1 ? lastRowWidth+5 : fontSize);
          node.last = nrows == 1;
          visit(nrows-1, ncols, node.values);
          collect_col_headers = false;
          if (nrows == 1) {
            y += h;
            node.w = lastRowWidth ;
            node.h = y - node.y - dy+1;
          } else {
            node.h = fontSize;
            node.w = y - node.y - dy;
          }
          x = node.x;
          y += dy;
          mat.header.rows.push(node);
        }
      }
      else {
        for (i=0, n=nodes.length; i<n; i++) {
          node = nodes[i];
          node.x = x;
          node.y = y;
          if (ncols == 1) {
            node.w = w;
            node.h = h;
            x += w;
            node.color = 'steelblue';
            mat.values.push(node);
            if (collect_col_headers) {
              mat.header.cols.push( {x: node.x, y: y0 - ncols*(fontSize + dy), w: node.w, h: fontSize, label: node.key});
            }
          } else {
            node.color = 'lightgreen';
            visit(nrows, ncols-1, node.values);
            node.w = x - dx - node.x;
            node.h = h;
            if (collect_col_headers) {
              node.y = y0 - ncols*(fontSize + dy);
              node.label = node.key;
              mat.header.cols.push(node);
            }
          }
          x += dx;
        }
      }
    }
  }

  function render(mat) {

    d3.select(root).select('#results').attr('height', y);

    var rows = d3.select(root).select('#results').selectAll('.row')
      .data(mat.header.rows);

    rows.enter()
      .append('div')
      .attr('class', 'row');

    rows
      .classed('rotate', function(d) { return !d.last; })
      .style('left', function(d) { return d.x;})
      .style('top', function(d) { return d.y+ (d.last ? 0 : d.w);})
      .style('width', function(d) { return d.w;})
      .style('height', function(d) { return d.h;})
      .style('overflow', 'hidden')
      .text(function(d) { return d.label;})
    ;

    rows.exit().remove();

    var cols = d3.select(root).select('#results').selectAll('.col')
      .data(mat.header.cols);

    cols.enter()
      .append('div')
      .attr('class', 'col');

    cols
      .style('left', function(d) { return d.x;})
      .style('top', function(d) { return d.y;})
      .style('width', function(d) { return d.w;})
      .style('height', function(d) { return d.h;})
      .style('overflow', 'hidden')
      .text(function(d) { return d.label;})
    ;

    cols.exit().remove();

    var d3nodes = d3.select(root).select('#results').selectAll('.value')
      .data(mat.values);

    d3nodes.enter()
      .append('div')
      .attr('class', 'value');

    d3nodes
      .style('left', function(d) { return d.x;})
      .style('top', function(d) { return d.y;})
      .style('width', function(d) { return d.w;})
      .style('height', function(d) { return d.h;})
      .style('background-color', function(d) { return color(d.values[valueSelector]); })
    ;

    d3nodes.exit().remove();
  }

  return {
  };

});