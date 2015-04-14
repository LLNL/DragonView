define(function(require) {
  var d3 = require('d3');

  return function() {
    var width = 100, height = 25,
      handle, d3axis,
      manual = false;

    var dispatch = d3.dispatch('start', 'move', 'end');
    var x = d3.scale.linear()
      .domain([0, 1])
      .range([0, width]);
      //.clamp(true);

    var axis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .ticks(4);
    //            .tickFormat(function (d) { return d ; })
    //            .tickSize(8, 8)
    //            .tickPadding(12)

    var brush = d3.svg.brush()
          .x(x)
          //.extent([0, 1])
          .on("brush", brushmove)
          .clear();
      ;

    function brushmove() {
      manual = true;
      var e = brush.extent();
      dispatch.move(e);
    }


    function slider(selection) {
      selection.each(function () {
        var g = d3.select(this);

        var frame = g.append("g")
          .attr('class', 'slider')
          .attr('width', width)
          .attr('height', height);

        d3axis = frame.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0.5,' + 10.5 + ')')
          .call(axis);

        handle = frame.append('g')
          .attr("class", "brush")
          .attr('transform', 'translate(0.5,' + 5 + ')')
          .call(brush);

        brush.clear();

        //    handle.selectAll('.resize').append('path')
        //        .attr('d', grasp);

        handle.selectAll("rect")
          .attr("height", 10);

        //handle.selectAll('.resize').selectAll('rect')
        //  .style('visibility', 'visible');
      });
    }

    slider.width = function (value) {
      if (!arguments.length) return width;
      width = value;
      //console.log('extent pre:', brush.extent());
      x.range([0, width]);
      brush.x(x);
      if (handle != undefined) {
        handle.call(brush);
        //console.log('extent: post', brush.extent());
      }

      return slider;
    };

    slider.height = function (value) {
      if (!arguments.length) return height;
      height = value;
      return slider;
    };

    slider.scale = function (s) {
      if (!arguments.length) return x;
      x = s;
      return slider;
    };

    slider.axis = function (a) {
      if (!arguments.length) return axis;
      axis = a;
      return slider;
    };

    slider.domain = function(value) {
      if (!arguments.length) return x.domain();
      x.domain(value);
      if (value[0] > 1000)
        axis.tickFormat(d3.format('.1e'));
      else
        axis.tickFormat(d3.format('g'));

      //g.select('.x')
      d3axis.call(axis);
      //var extent = brush.extent();
      //if (manual) {
      //  if (extent[0] < value[0]) extent[0] = value[0];
      //  if (extent[1] > value[1]) extent[1] = value[1];
      //  brush.extent(extent);
      //} else {
      //  brush.extent(x.domain());
      //}
      brush.extent(x.domain());

      if (handle) handle.call(brush);
      return slider;
    };

    slider.extent = function(value) {
      if (!arguments.length) return brush.extent();
      brush.extent(value);
      return slider;
    };

    slider.on = function(type, listener) {
      dispatch.on(type,  listener);
      return slider;
    };

    return slider;
  };
});