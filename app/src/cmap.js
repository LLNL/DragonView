/**
 * Created by yarden on 11/24/16.
 */


define(function(require) {

	var d3 = require('d3');

	return function() {
		var COLORS = ["#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027"];
		var value_scale = d3.scale.linear().domain([0, 0.5, 1]).range([0, 0.5, 1]).clamp(true);
		var color_scale = d3.scale.quantize().domain([0, 1]).range(COLORS);

		function cmap(v) {
			return color_scale(value_scale(v));
		}

		cmap.value_range = function (_) {
			if (!arguments.length) return value_scale.domain();
			value_scale.domain(_);
			return cmap;
		};

		cmap.colors = function (_) {
			if (!arguments.length) return color_scale.range();
			color_scale.range(_);
			return cmap;
		};

		return cmap;
	}
});