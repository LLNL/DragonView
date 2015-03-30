/**
 * Created by yarden on 3/25/15.
 */
define(function(require) {
  var  Radio = require('radio'),
       d3 = require('d3');

  return function() {
    Radio.channel('data').on('run', newRun);

    function newRun(run) {
      var jobs = run.jobs.values().sort(function(a,b) { return b.n - a.n;});

      d3.select('#jobs').select('tbody').selectAll('tr').remove();

      d3.select('#jobs').select('tbody').selectAll('tr')
        .data(jobs, function(d) { return d.id;})
        .enter()
          .append('tr')
          .call(render);
    }

    function render() {
      this.append('td')
        .text(function(d) { return d.id;});

      this.append('td')
        .text(function(d) { return d.n;});

      this.append('td')
        .append('div')
        .style('width', '20px')
        .style('height', '10px')
        .style('background-color', function(d) { return d.color; });
    }
  };
});