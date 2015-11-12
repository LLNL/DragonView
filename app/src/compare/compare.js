/**
 * Created by yarden on 11/10/15.
 */

define(function(require) {

  var d3 = require('d3');

  var localWindow = null;
  var root = null;
  var data = null;
  var fields = {
    config:  {type: 'category', values: []},
    dataset: {type: 'category', values: []},
    sim:     {type: 'category', values: []},
    jobid:   {type: 'category', values: []},
    color:   {type: 'category', values: [0, 1, 2, 3]}
  };

  var options = ['', 'opt 1', 'opt 2'];

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

    d3.select(root).select('#compare-options')
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

  function select() {
    var opt = d3.select(this).property('value');
    if (opt == 'opt 1') {
      compute();
    }
    else if (opt == 'opt 2') {

    }
  }

  function compute() {
    var active = data.filter(function (d) { return d.config == 'default' && d.dataset == '4jobs-1' });

    var rows = d3.nest()
      .key(function(d) { return d.sim;})
      .key(function(d) { return d.jobid;})
      .key(function(d) { return d.color;})
      .rollup(function(leaves) { return d3.max(leaves, function(d) { return d.max; }); })
      .entries(active);

    render(rows);
  }

  var x0 = 100, y0 = 100;
  var dx = 2, dy = 2;
  var w0 = 5, h0 = 5;
  var x, y, w, h;

  function collect(nrows, ncols, rows) {
    x = x0;
    y = y0;
    w = 0;
    h = 0;

    visit(nrows, ncols, rows);

    function visit(nrows, ncols, node) {
      var i = 0;
      node.x = x; node.y = y;
      if (nrows > 0) {
        x += w0;
        for (i=0, n=node.values.length; i<n; i++) {
          visit(nrows-1, ncols, node.values[i]);
          x = x0;
          y += dy;
        }
        node.w = w0; node.h = y - dy - node.y;
      }
      else {
        if (ncols == 0) {
          x += dx;

          node.w = w0;
          node.h = h0;
          x += w0 + dy;
        } else {
          for (i=0, n=node.values.length; i<n; i++) {
            visit(0, ncols-1, node.values[i]);
          }
        }
      }
    }
  }

  function render(rows) {
    console.log(rows);
    //var items = d3.select(root).select('#results').selectAll('li')
    //  .data(rows);
    //
    //items.enter().append('li');
    //items.
  }

  return {
  };

});