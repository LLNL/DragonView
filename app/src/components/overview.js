/**
 * Created by yarden on 7/24/16.
 */

import * as d3 from 'd3';

import template from './overview.html!text';

import model from '../model/data';

class Overview {
  constructor(opt) {
    opt = opt || {};
    this.width = opt.width || 50;
    this.height = opt.height || 100;
    this.svg = null;

    if (opt.el) this.init(opt.el);
    this.timestep = -1;
    this.counter_name = "";
  }

  init(el) {
    this.root = el;
    d3.select(el)
      .attr('class', 'overview')
      .html(template);

    // this.svg = d3.select(el).append('svg')
    //   .attr('class', 'run_overview')
    //   .attr('width', this.width)
    //   .attr('height', this.height);
    //
    // let g = this.svg.append('g');
    // g.append('g').attr('class', 'bars');

    return this;
  }


  select_run(r) {
    if (r != -1) {
      let run = model.runs[r];
      if (model.dragonfly.names.indexOf(this.counter_name) == -1) {
        this.counter_name = model.dragonfly.names[0];
      }
      this.timestep = Math.min(Math.max(run.start, this.timestep), run.end);

      d3.select(this.root).select('#counter').property('value', this.timestep);
      de.select(this.root).select('#counter').property('val')

      model.counter(run.id, this.timestep, this.counter_name)
        .then(data => this.show(data));
    }
  }

  show(data) {
    let dragonfly = model.dragonfly;
    let links = dragonfly.links;
    let series = {
      b_in: Array(dragonfly.n_groups).fill(0),
      b_out:Array(dragonfly.n_groups).fill(0),
      g: Array(dragonfly.n_groups).fill(0),
      k: Array(dragonfly.n_groups).fill(0)
    };

    for (let d of data) {
      let link = links[d.link_id];
      let type = link.type;
      if (link.type == 'b') {
        series['b_out'][link.sg] += d[this.counter_name];
        series['b_in'][link.dg] += d[this.counter_name];
      } else {
        series[link.type][link.sg] += d[this.counter_name];
      }
    }

    console.log('timestep:', this.timestep, 'counter:', this.counter_name);
    for (let s of Object.keys(series)) {
      console.log('\t', s,':', series[s]);
    }
  }


}

export default Overview;