/**
 * Created by yarden on 11/10/15.
 */

define(function(require) {

  var d3 = require('d3');

  var localWindow = null;
  var root = null;
  var data = null;
  var fields = {
    config: {type: 'category', values: []},
    dataset: {type: 'category', values: []},
    sim: {type: 'category', values: []},
    jobid: {type: 'category', values: []},
    color: {type: 'category', values: [0, 1, 2, 3]}
  };

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

          findValues(rows);

          var li = d3.select(root).select('#info #fields').selectAll('li')
            .data(Object.keys(fields))
            .enter()
              .append('li');

          li.append('label')
            .attr('class', 'li-title')
            .text(function(d) { return d; });

          li.append('ul')
            .attr('class', 'values')
            .selectAll('li')
              .data(function(d) { return fields[d].values})
              .enter()
                .append('li')
                .attr('class', 'value')
                .text(function(d) { return d});

        }
      });
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

  function compute() {
    var active = data.filter(function (d) { return d.config == 'default' && d.dataset == '4jobs-1' && d.color == 0});

    var rows = d3.nest()
      .key(function(d) { return d.sim})
      .key(function(d) { return d.jobid})
      .rollup(function(leaves) { return d3.max(leaves, function(d) { return d.max; }); })
      .entries(active);

    render(rows);
  }

  function render(rows) {
    console.log(rows);
    //var items = d3.select(root).select('#compare').selectAll('li')
    //  .data(rows);
    //
    //items.enter().append('li');
    //items.
  }

  return {
  };

});