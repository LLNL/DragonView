/**
 * Created by yarden on 11/24/16.
 */
define(function(require) {

	var d3 = require('d3');

	return function() {
		var selection = null;
		var colors = null;
		var horizontal = true;
		var dispatch = d3.dispatch("changed");

		var size = 100;
		var mid = 0.5;
		var mid_pos = Math.floor(mid * size);

		function mouse_update(mouse_pos) {
			var pos = horizontal ? mouse_pos[0] : size - mouse_pos[1];
			if (pos == mid_pos) return;
			mid_pos = pos;
			mid = mid_pos/size;
			render();
			dispatch.changed(mid);
		}

		function update(f) {
			if (mid == f) return;
			mid = f;
			mid_pos = mid * size;
			render();
		}

		function render() {
			if (selection)
				selection
					.style('background-image', "linear-gradient(" + (horizontal ? "to right, " : "to top, ") + create() + ")");
		}

		function create() {
			return colors.map(function(v,i) { return i==4 ? v + " " + Math.floor(mid*100) + "%" : v;}).toString();
		}

		function swath(_) {
			selection = _;
			selection
				.on('mousedown', function () {
					d3.event.preventDefault();
					selection
						.on('mousemove', function () {
							mouse_update(d3.mouse(this));
						})
						.on('mouseup', function () {
							selection
								.on('mousemove', null)
								.on('mouseup', null);
						});
					mouse_update(d3.mouse(this));
				});
			render();
			return this;
		}

		swath.colors = function(_) {
			if (!arguments.length) return colors;
			colors = _.concat();
			return swath;
		};

		swath.size = function(_) {
			if (!arguments.length) return size;
			size = _;
			return swath;
		};

		swath.horizontal = function(_) {
			if (!arguments.length) return horizontal;
			horizontal = _;
			return swath;
		};

		swath.mid = function(_) {
			if (!arguments.length) return mid;
			mid = _;
			return swath;
		};

		swath.update = function(_) {
			update(_);
			return swath;
		};

		swath.on = function(type, cb) {
			dispatch.on(type, cb);
			return swath;
		};

		return swath;
	}
});