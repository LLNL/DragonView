/**
 * Created by yarden on 7/24/16.
 */

import * as d3 from 'd3';
// import * as pubsub from '../utils/pubsub';
// import template from './overview.html!text';

import model from '../model/data';

const MARGIN = {left: 20, right: 0, top:0, bottom: 20};
const SPACING = 5;

class Overview {
  constructor(opt) {
    opt = opt || {};
    this._margin = opt.margin || {left: 5, right: 5, top:5, bottom: 5};
    this._width = opt.width || 300;
    this._height = opt.height || 150;
    this._chart_width = 50;
    this._chart_height = 100;
    this._svg = null;
    this._run = null;
    this._timestep = -1;
    this._counter = "";

    this._x = d3.scaleLinear();

    this._y = d3.scaleBand()
      .align(1)
      .paddingInner(0.1);

    this._charts = [
      {id: 'b_in',  title:'Blue in',  idx: 0, data: null},
      {id: 'b_out', title:'Blue out', idx: 1, data: null},
      {id: 'g',     title:'Green',    idx: 2, data: null},
      {id: 'k',     title:'Black',    idx: 3, data: null}
    ];
    this._map = {};
    for (let chart of this._charts) {
      this._map[chart.id] = chart;
    }

    this.resize(this._width, this._height);
    if (opt.el) this.init(opt.el);
  }

  resize(w, h) {
    this._width = w;
    this._height = h;
    this._chart_width = (w - this._margin.left - this._margin.right - 3 * SPACING)/4;
    this._chart_height = h - this._margin.top - this._margin.bottom;

    this._x.range([0, this._chart_width - MARGIN.left - MARGIN.right]);
    this._y.rangeRound([this._chart_height-MARGIN.top - MARGIN.bottom, 0]);
  }

  init(el) {
    if (this._svg) return;
    this._svg = d3.select(el)
      .attr('class', 'overview-svg')
      .attr('width', this._width)
      .attr('height', this._height);

    let g = this._svg.selectAll('g')
      .data(this._charts)
      .enter()
      .append('g')
        .attr('transform', d => `translate(${this._margin.left + (SPACING+this._chart_width) * d.idx}, ${this._margin.top + MARGIN.top})`);

    g.append('g')
        .attr('class', d => `chart chart-${d.id}`);

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', d => `translate(${MARGIN.left}, ${this._chart_height-MARGIN.top-MARGIN.bottom})`);

    g.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', d => `translate(${MARGIN.left}, 0)`);

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
    this._y.domain(d3.range(dragonfly.n_groups));

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
    let h = y.bandwidth();
    let x_axis = d3.axisBottom(x).ticks(1, 's');
    let y_axis = d3.axisLeft(y).tickValues([4, 8, 12]).tickSizeInner(0);

    for (let chart of this._charts) {
      let bars = this._svg.select(`.chart-${chart.id}`).selectAll('.bar')
      .data(chart.data);

      let bar = bars.enter().append('g')
        .attr('class', 'bar')
        .attr('transform', (d, i) => `translate(${MARGIN.left}, ${y(i)})`);

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

    this._svg.selectAll('.axis--x').call(x_axis);
    this._svg.selectAll('.axis--y').call(y_axis)
  }


}

export default Overview;