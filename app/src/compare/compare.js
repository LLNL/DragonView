/**
 * Created by yarden on 11/10/15.
 */

define(function(require) {

  var d3 = require('d3');
  var config = require('config');

  var localWindow = null;
  var root = null;
  var data = null;
  var mat;
  var valueSelector = 'min';
  var fields = {
    config:  {name: 'config',  type: 'category', values: []},
    dataset: {name: 'dataset', type: 'category', values: []},
    sim:     {name: 'sim',     type: 'category', values: []},
    jobid:   {name: 'jobid',   type: 'category', values: []},
    color:   {name: 'color',   type: 'category', values: [0, 1, 2, 3]}
  };

  var options = ['', 'config,dataset,sim / color,jobid', 'config,sim / dataset,color,jobid'];

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

  function init() {
    root = localWindow.document.body;
    d3.select(root).select('#show')
      .on('click', compute);

    d3.select(root).select('#select-options')
      .on('change', select)
      .selectAll('option')
      .data(options)
      .enter()
        .append('option')
        .attr('value', function(d) {return d;})
        .text(function(d) { return d;});


    console.log('Compare: loading data');

    d3.csv('data/alldata.csv')
      .get(function(error, rows) {
        if (error) {
          console.err(error);
        }
        else if (rows.length == 0) {
          console.log('empty dataset');
        }
        else {
          data = rows;
          d3.select(root).select('#size').text(rows.length);

          var keys = Object.keys(rows[0]);
          while(keys[0]  != 'min') keys.shift();
          rows.forEach(function(row) {
            keys.forEach(
              function(key) { row[key] = +row[key]; })
          });

          d3.select(root).select('#select-values')
            .on('change', function() {
              valueSelector = d3.select(this).property('value');
              render(mat);})
            .selectAll('option')
            .data(keys)
            .enter()
              .append('option')

              .attr('value', function(d) {return d;})
              .text(function(d) { return d;});

          setupFields();
        }
      });
  }

  function setupFields() {
    findValues(data);

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
      .data(function(d) { return fields[d].values})
      .enter()
      .append('li')
      .attr('class', 'value');

    entry
      .append('input')
      .attr('type', 'checkbox')
      .property('value', function(d) { return d});

    entry
      .append('text')
      .text(function(d) { return d});
  }

  function findValues(rows) {
    var config = new Set();
    var dataset = new Set();
    var sim = new Set();
    var jobid = new Set();

    rows.forEach(function(row) {
      config.add(row.config);
      dataset.add(row.dataset);
      sim.add(row.sim);
      jobid.add(row.jobid);
    });

   fields.config.values = Array.from(config).sort();
   fields.dataset.values = Array.from(dataset).sort();
   fields.sim.values = Array.from(sim).sort();
   fields.jobid.values = Array.from(jobid).sort();

  }

  function select(d) {
    var config;
    var opt = d3.select(this).property('value');
    if (opt == 'config,dataset,sim / color,jobid') {
      config = {
        rows: [fields.config, fields.dataset, fields.sim],
        cols: [fields.color, fields.jobid],
        filter: function(d) { return d.dataset == '4jobs-1' || d.dataset == '4jobs-2'}
      };
    }
    else if (opt == 'config,sim / dataset,color,jobid') {
      config = {
        rows: [fields.config, fields.sim],
        cols: [fields.dataset, fields.color, fields.jobid],
        filter: function(d) { return d.dataset == '8jobs-1'; }
      };
    }
    var tree = compute(config);
    mat = collect(config, tree);
    render(mat);
  }

  function compute(config) {
    var active = config.filter && data.filter(config.filter) || data;

    var nest = d3.nest();
    config.rows.forEach(function(field) { nest.key(function(d) { return d[field.name];}); } );
    config.cols.forEach(function(field) { nest.key(function(d) { return d[field.name];}); } );

    return nest.rollup(function(leaves) { return {
        min: d3.min(leaves, function(d) { return d.min; }),
        avg: d3.sum(leaves, function(d) { return d.avg; })/leaves.length,
        max: d3.max(leaves, function(d) { return d.max; }),
        nonzero: d3.max(leaves, function(d) { return d.nonzero; }),
        nzavg: d3.sum(leaves, function(d) { return d.nzavg; })/leaves.length
      }})
      .entries(active);
  }

  var x0 = 100, y0 = 100;
  var dx = 2, dy = 2;
  var w = 10, h = 10;
  var fontSize = 15;
  var x, y;

  function collect(config, nodes) {
    x = x0;
    y = y0;
    var mat = {header: {rows:[], cols:[]}, values:[]};
    var collect_col_headers = true;

    visit(config.rows.length, config.cols.length, nodes);
    return mat;

    function visit(nrows, ncols, nodes) {
      var i, n, node, nr = config.rows.length, nc = config.cols.length;
      if (nrows > 0) {
        for (i=0, n=nodes.length; i<n; i++) {
          node = nodes[i];
          node.label = node.key;
          node.x = x;
          node.y = y;
          x += fontSize+dx;
          visit(nrows-1, ncols, node.values);
          collect_col_headers = false;
          if (nrows == 1) y += h;
          node.w = fontSize;
          node.h = y - node.y - dy;
          x = node.x;
          y += dy;
          node.color = 'red';
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

    var rows = d3.select(root).select('#results').selectAll('.row')
      .data(mat.header.rows);

    rows.enter()
      .append('div')
      .attr('class', 'row');

    rows
      .style('left', function(d) { return d.x;})
      .style('top', function(d) { return d.y+ d.h;})
      .style('width', function(d) { return d.h;})
      .style('height', function(d) { return d.w;})
      .style('overflow', 'hidden')
      .text(function(d) { return d.label;})
     //.style('background-color', function(d) { return d.color;})
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
      //.style('background-color', function(d) { return d.color;})
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
      .style('background-color', function(d) {
        return config.color(d.values[valueSelector]);})
    ;

    d3nodes.exit().remove();
  }

  return {
  };

});