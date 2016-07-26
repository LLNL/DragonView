/**
 * Created by yarden on 7/24/16.
 */
import * as d3 from 'd3';

export default function () {

  let margin = {top: 5, right:5, bottom: 20, left: 25},
    width = 100-margin.left-margin.right,
    height = 50 - margin.top - margin.bottom,
    color = 'steelblue';

  let x = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([0, 1])
    .rangeRound([height, 0]);


  function bars(selection) {
    selection.each(function(d) {
      let chart = d3.select(this);

      let bar = chart.select('.bars').selectAll('.bar')
          .data(d.bins);

      bar.enter().append('rect')
        .attr('class', 'bar')
        .attr('y', height)
        .attr('height', 0)
        .merge(bar)
          .attr('x', d => x(d.x0))
        .attr('width', d => x(d.x1) - d(d.x0) -1)
        .transition()
        .duration(duration)
        .attr('y', d => y(d.length))
        .attr('height', d => height - y(d.length));

      b.exit().remove();
    })
  }
}