/**
 * Created by yarden on 4/2/15.
 */



define(function(require) {

  var d3 = require('d3');


  var value_band = d3.scale.linear().rangeRound([8, 0]);
  var VALUES_COLORMAP =["#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027"];
  var JOBS_COLORMAP = colorbrewer.Set2[8];
  var value_color = d3.scale.ordinal().domain([0, 8]).range(VALUES_COLORMAP);
  var scale = d3.scale.quantize().domain([0,1]).range(VALUES_COLORMAP);
  var value_scale = d3.scale.linear().domain([0, 0.5, 1]).range([0, 0.5, 1]).clamp(true);
  var data_range = [0, 1];

  return {
    MULTI_JOBS_COLOR: '#00ffff',
    UNKNOWN_JOB_COLOR: '#e0e0e0',
    VALUES_COLORMAP: VALUES_COLORMAP,
    JOBS_COLORMAP: JOBS_COLORMAP,

    ROUTER_RADIUS: 2.5,
    ROUTER_RADIUS_INACTIVE: 1.5,
    ROUTER_RADIUS_HIGHLIGHT: 4,

    value_scale: value_scale,

    jobColor: function(id) {
      id = Math.min(id, JOBS_COLORMAP.length-1);
      return JOBS_COLORMAP[id];
    },

    data_range: function(range) {
      if (!arguments.length) return data_range;
      data_range = range;
      // if (!arguments.length) return scale.domain();
      // return scale.domain(range);
    },

    color: function (v) {
      return scale(value_scale(v));
    },

    color2: d3.scale.linear()
      .range(['#ff0000', '#00ff00'])
      .interpolate(d3.interpolateHcl)
  }
});
