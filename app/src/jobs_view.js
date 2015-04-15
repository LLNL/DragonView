/**
 * Created by yarden on 3/25/15.
 */
define(function(require) {
  var  Radio = require('radio'),
       d3 = require('d3'),
      config = require('config');

  return function() {
    Radio.channel('data').on('run', newRun);

    var colors = colorbrewer.Set1[8];
    var context;
    var currentRun;

    d3.select('body').append('div')
      .attr('class', 'color-menu')
      .style('display', 'none')
      .selectAll('div').data(colors)
      .enter()
        .append('div')
          .attr('class', 'color-entry')
          .style('width', '20px')
          .style('height', '10px')
          .style('background-color', function(d) { return d })
          .on('mouseup', function(d, i) {
            context.color = d;
            currentRun.updateJobColor(context.idx, d);
            update();
            d3.select('.color-menu').style('display', 'none')
          });

    d3.select('body').on('click.color-menu', function() {
      d3.select('.color-menu').style('display', 'none');
    });

    function update() {
      newRun(currentRun);
      Radio.channel('data').trigger('update', currentRun);
    }

    function newRun(run) {
      currentRun = run;
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
        .style('background-color', function(d) { return d.color; })
        .on('mousedown', function(d) {
          context = d;
          d3.select('.color-menu')
            .style('position', 'absolute')
            .style('left', (d3.event.pageX-5) + "px")
            .style('top', (d3.event.pageY-5) + "px")
            .style('display', 'block');
          d3.event.preventDefault();
          d3.event.stopPropagation();
        })
    }
  };
});