/**
 * Created by yarden on 7/27/16.
 */


import * as d3 from 'd3';

export default function() {
  let
    margin = {left: 20, right:0, top:0, bottom:20},

    width = 50,
    height = 150,
    x = d3.scaleLinear()
      .domain([0,1])
      .range([0, width - margin.left -margin.right]),
    y = d3.scaleBand()
      .domain([0, 1])
      .rangeRound([height - margin.top - margin.bottom, 0])
      .align(1)
      .paddingInner(0.1),
    x_axis = d3.axisBottom(x),
    y_axis = d3.axisLeft(y);

  function chart(selection){
    selection.each(function(d, i) {
      let h = y.bandwidth();
      let g = d3.select(this);

      let bars = g.select('.bars');
      if (bars.empty()) {
        bars = g.append('g')
          .attr('class', 'bars');
      }

      let bar = bars.selectAll('.bar').data(d.data);

      let enter = bar.enter().append('g')
        .attr('class', 'bar')
        .attr('transform', (d, i) => `translate(${margin.left}, ${y(i)})`);

      enter.append('rect')
        .attr('class','max')
        .attr('x', 1);

      enter.append('rect')
        .attr('class','avg')
        .attr('x', 1);

      bar = enter.merge(bar);

      bar.selectAll('.max')
        .attr('width', d => x(d.max))
        .attr('height', d => h);

      bar.selectAll('.avg')
        .attr('width', d => x(d.avg))
        .attr('height', d => h);

      let axis;
      axis = (axis = g.select('.axis--x')).empty() ?
            g.append('g')
              .attr('class', 'axis axis--x')
              .attr('transform', `translate(${margin.left}, ${height - margin.top - margin.bottom})`)
          : axis;

      axis.call(x_axis);


      axis = (axis = g.select('.axis--y')).empty() ?
                g.append('g')
                  .attr('class', 'axis axis--y')
                  .attr('transform', `translate(${margin.left}, 0)`)
                : axis;
      axis.call(y_axis);
    });
  }

  chart.size = function(_) {
    if (!arguments.length) return [width, height];
    [width, height] = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return this;
  };

  chart.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return chart;
  };

  chart.x_axis = function(_) {
    if (!arguments.length) return x_axis;
    x_axis = _;
    return chart;
  };

  chart.y_axis = function(_) {
    if (!arguments.length) return y_axis;
    y_axis = _;
    return chart;
  };

  return chart;
}