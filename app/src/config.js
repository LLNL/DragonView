/**
 * Created by yarden on 4/2/15.
 */
define(function(require) {

  var d3 = require('d3');

  var value_band = d3.scale.linear().rangeRound([8, 0]);
  var value_color = d3.scale.ordinal().domain([0, 8]).range(colorbrewer.YlOrRd[9]);
  var scale = d3.scale.quantize().range(colorbrewer.YlOrRd[9]);

  return {
    data_range: function(range) {
      if (!arguments.length) return scale.domain();
      return scale.domain(range);
    },
    color: function (v) {
      return scale(v);
    },
    color2: d3.scale.linear()
      //.range(['#ffffbe', '#531a00'])
      //.range(["#ffffcc", "#800026"])
      //.range(['#fef3e5', '#700000'])
      .range(['#ff0000', '#00ff00'])
      .interpolate(d3.interpolateHcl)
  }
});
