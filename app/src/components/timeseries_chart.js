/**
 * Created by yarden on 7/26/16.
 */

import * as d3 from 'd3';

import model from '../model/data';

class TimeseriesChart {
  constructor(opt) {

  }

  init(el) {
    if (this._svg) return;

    this._svg = d3.select(el)
      .attr('class', 'timeseries-svg')
      .attr('width', this._width)
      .attr('height', this._height);

  }
}

export default TimeseriesChart;