/**
 * Created by yarden on 7/24/16.
 */

import * as d3 from 'd3';
// import * as pubsub from '../utils/pubsub';
// import template from './overview.html!text';

import model from '../model/data';


class Overview {
  constructor(opt) {
    opt = opt || {};

    this._chart_width = opt.chart_width || 50;
    this._chart_height = opt.chart_height || 100;
    this._svg = null;
    this._run = null;
    this._timestep = -1;
    this._counter = "";
    this._series = {};
    this._x = d3.scaleLinear().range([0, this._chart_width]);
    this._y = d3.scaleLinear().rangeRound([this._chart_height, 0]);

    this._charts = [
      {id: 'b_in',  title:'Blue in',  idx: 0, data: null},
      {id: 'b_out', title:'Blue out', idx: 1, data: null},
      {id: 'g',    title:'Green',    idx: 2, data: null},
      {id: 'k',    title:'Black',    idx: 3, data: null}
    ];
    this._map = {};
    for (let chart of this._charts) {
      this._map[chart.id] = chart;
    }

    if (opt.el) this.init(opt.el);
  }

  init(el) {
    if (this._svg) return;
    this._svg = d3.select(el)
      .attr('class', 'overview');

    this._svg.selectAll('g')
      .data(this._charts)
      .enter().append('g')
        .attr('class', d => `chart-${d.id}`)
        .attr('transform', d => `translate(${10 + (10+this._chart_width) * d.idx}, 10)`);

    return this;
  }


  select_run(idx) {
    if (idx != -1) {
      this._run = model.runs[idx];
      if (model.dragonfly.names.indexOf(this._counter) == -1) {
        this._counter = model.dragonfly.names[0];
      }
      this._timestep = Math.min(Math.max(this._run.start, this._timestep), this._run.end);

      model.counter(this._run.id, this._timestep, this._counter)
        .then(data => this._process(data));
    }
  }

  _process(data) {
    let dragonfly = model.dragonfly;
    let links = dragonfly.links;
    for (let chart of this._charts) {
      let s = [];
      for (let i=0; i<dragonfly.n_groups; i++) {
        s.push({n: 0, max: 0, value: 0});
      }
      chart.data = s;
    }

    for (let d of data) {
      let value = d[this._counter];
      let link = links[d.link_id];
      let type = link.type;
      if (link.type == 'b') {
        Overview._inc(this._map['b_out'].data[link.sg], value);
        Overview._inc(this._map['b_in'].data[link.dg], value);
      } else {
        Overview._inc(this._map[link.type].data[link.sg], value);
      }
    }

    let max = 0;
    for (let chart of this._charts) {
      for (let item of chart.data) {
        item.avg = item.n && item.value/item.n || 0;
        if (item.max > max) max = item.max;
      }
    }

    this._x.domain([0, max]);
    this._y.domain([0, dragonfly.n_groups]);

    console.log(this._charts);

    this._render();
  }

  static _inc(stat, v) {
    stat.n++;
    if (v > stat.max) stat.max = v;
    stat.value += v;
  }

  _render() {
    let x = this._x;
    let y = this._y;
    let h = y(0) - y(1) -1;

    for (let chart of this._charts) {
      let bars = this._svg.select(`.chart-${chart.id}`).selectAll('.bar')
      .data(chart.data);

      let bar = bars.enter().append('g')
        .attr('class', 'bar')
        .attr('transform', (d, i) => `translate(0, ${y(i)})`);

      bar.append('rect')
        .attr('class','max')
        .attr('x', 1);

      bar.append('rect')
        .attr('class','avg')
        .attr('x', 1);

      bar.merge(bars).selectAll('.max')
        .attr('width', d => x(d.max))
        .attr('height', d => h);

      bar.merge(bars).selectAll('.avg')
        .attr('width', d => x(d.avg))
        .attr('height', d => h);
    }
  }


}

export default Overview;