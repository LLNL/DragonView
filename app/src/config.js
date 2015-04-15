/**
 * Created by yarden on 4/2/15.
 */
define(function(require) {

  var d3 = require('d3');

  var value_band = d3.scale.linear().rangeRound([8, 0]);
  var value_color = d3.scale.ordinal().domain([0, 8]).range(colorbrewer.YlOrRd[9]);
  var scale = d3.scale.quantize().range(colorbrewer.YlOrRd[9]);
  var JOBS_COLORMAP = colorbrewer.Set1[8].concat();

  return {
    MULTI_JOBS_COLOR: '#00ffff',
    UNKNOWN_JOB_COLOR: '#a0a0a0',

    jobColor: function(id) {
      id = Math.min(id, JOBS_COLORMAP.length-1);
      return JOBS_COLORMAP[id];
    },

    data_range: function(range) {
      if (!arguments.length) return scale.domain();
      return scale.domain(range);
    },

    color: function (v) {
      return scale(v);
    },

    color2: d3.scale.linear()
      .range(['#ff0000', '#00ff00'])
      .interpolate(d3.interpolateHcl)
  }
});
