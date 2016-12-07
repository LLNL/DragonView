/**
 * Created by yarden on 3/25/15.
 */
define(function(require) {
  var  Radio = require('radio'),
       d3 = require('d3'),
      config = require('config');

  return function(id_, doc) {
    var localDocument = doc;
    var root = d3.select(localDocument);
    var id = id_;

    Radio.channel(id).on('data.run', newRun);
    Radio.channel(id).on('routers.active', active_routers);

    var colors = config.JOBS_COLORMAP; // colorbrewer.Set2[8];
    var context;
    var currentRun;

    root.select('body').append('div')
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
            currentRun.updateJobColor(context, d);
            update();
            root.select('.color-menu').style('display', 'none')
          });

    root.select('body').on('click.color-menu', function() {
      root.select('.color-menu').style('display', 'none');
    });

    function update() {
      newRun(currentRun);
      Radio.channel(id).trigger('data.update', currentRun);
    }

    function newRun(run) {
      currentRun = run;
      var jobs = run.jobs.values().sort(function(a,b) { return b.n - a.n;});
      var l = jobs.length/2;

      root.select('#jobs').selectAll("div").remove();

      root.select('#jobs').selectAll("div")
        .data(jobs, function(d) { return d.id;})
        .enter()
          .append('div')
          .attr('class', 'job-entry')
          .style('position', 'absolute')
          .style('top', function(d,i) { return (i<l ? i:i-l)*15+'px'; })
          .style('left', function(d,i) { return i<l ? 0: '115px'; })
          .style('font-size', '8pt')
          .call(render);

      root.select('#jobs').style('height', (5+l*15)+'px');
    }

    function active_routers(routers) {
      var n;
      currentRun.jobs.forEach(function(k, job) { job.active = 0;});

      routers.forEach(function(k, router) {
        n = router.jobs.length;
        while (--n != -1) {
          router.jobs[n].active++;
        }
      });

      root.select('#jobs').selectAll('div').select('.active').text(function(d) {
        return d.active;
      });
    }

    function render() {
      var clickTimer;
      var hoverTimer;
      var selected = null;

      this.append('div')
        .attr('class', 'job-color')
        .style('background-color', function(d) { return d.color; })
        .on('mouseover', function(d) {
          if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
          }
          Radio.channel(id).trigger('job.highlight', d, true);
        })
        .on('mouseout', function(d) {
          hoverTimer = setTimeout(function() {
            console.log('out:',d ,selected);
            if (selected)
              Radio.channel(id).trigger('job.highlight', selected, true);
            else
              Radio.channel(id).trigger('job.highlight', d, false);
            hoverTimer = null;
          }, 20);
        })
        .on('mousedown', function(d) {
          var x= d3.event.pageX-5;
          var y = d3.event.pageY-5;
          d3.event.preventDefault();
          d3.event.stopPropagation();
          clickTimer = setTimeout(function() {
            context = d;
            root.select('.color-menu')
              .style('position', 'absolute')
              .style('left', x + "px")
              .style('top', y + "px")
              .style('display', 'block');
            clickTimer = null;
          }
          ,50);
        })
        .on('mouseup', function(d) {
          if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
            selected = selected == d ? null : d;
            root.select('#jobs').selectAll('.job-color')
              .classed('selected', function(j) { return j == selected});

            Radio.channel(id).trigger('job.highlight', d, d == selected);
          }
        });


      this.append('span').text(function(d) { return d.id;}).style('padding-left', '5px');
      this.append('span').text(function(d) { return d.n;}).style('padding-left', '10px');
      this.append('span').attr('class', 'active').text(function(d) { return d.n;}).style('padding-left', '10px');
    }

  };
});
