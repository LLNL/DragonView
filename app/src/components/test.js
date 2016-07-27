/**
 * Created by yarden on 7/27/16.
 */

import * as d3 from 'd3';
import model from '../model/data';
import Groups from './groups';
import Pole from '../charts/pole';
import group from '../stat/group';

export default function() {
  let series =  [
    {id: 'b_in',  title:'Blue in',  data: [], collect: group().filter(d=>d.link.type=='b').key(d=>d.link.dg)},
    {id: 'b_out', title:'Blue out', data: [], collect: group().filter(d=>d.link.type=='b').key(d=>d.link.sg)},
    {id: 'g',     title:'Green',    data: [], collect: group().filter(d=>d.link.type=='g').key(d=>d.link.sg)},
    {id: 'k',     title:'Black',    data: [], collect: group().filter(d=>d.link.type=='k').key(d=>d.link.sg)}
  ];

  let chart = Pole();
  let svg, poles;
  let max;

  chart.x_axis().ticks(1, 's').tickSizeOuter(0);
  chart.y_axis().tickSizeInner(0).tickSizeOuter(0);

  function update(data) {
    if (data && data.length>0 && !data[0].link) {
      let dragonfly = model.dragonfly;
      let links = dragonfly.links;

      for (let item of data) {
        item.link = links[item.link_id];
      }
    }
    return data;
  }

  function process(data) {
    for (let seq of series) seq.data = seq.collect(data);
    return d3.max(series, d => d3.max(d.data, d => d.max));
  }

  function render(max) {
    let dragonfly = model.dragonfly;

    chart.x().domain([0, max]);
    chart.y().domain(d3.range(dragonfly.n_groups));
    chart.y_axis().tickValues(d3.range(3, dragonfly.n_groups, 3));
    poles.datum((d,i) => series[i]).call(chart);
  }

  function test(el) {
    svg = d3.select(el);

    poles = svg.selectAll('g')
      .data(series)
      .enter().append('g')
        .attr('class', d => `chart chart-${d.id}`)
        .attr('transform', (d, i) => `translate(${30+60*i}, 10)`)
        .call(chart);

    return test;
  }

  test.run = function(run, timestep, counter) {
    let dragonfly = model.dragonfly;

    for (let seq of series) {
      seq.collect.value(d => d[counter]).bins(dragonfly.n_groups);
    }

    model.counter(run.id, timestep, counter)
      .then(update)
      .then(process)
      .then(render);

    return test;
  };

  return test;
}