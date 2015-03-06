define(function(require) {
  var d3 = require('d3');

  return function() {
    var width = 100, height = 25,
      handle;

    var dispatch = d3.dispatch('start', 'move', 'end');
    var x = d3.scale.linear()
      .domain([0, 1])
      .range([0, width]);
      //.clamp(true);

    var axis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .ticks(2);
    //            .tickFormat(function (d) { return d ; })
    //            .tickSize(8, 8)
    //            .tickPadding(12)

    var brush = d3.svg.brush()
          .x(x)
          //.extent([0, 1])
          .on("brush", brushmove)
      ;

    function brushmove() {
      var e = brush.extent();
      dispatch.move(e[0], e[1]);
    }


    function slider(selection) {
      selection.each(function () {
        var g = d3.select(this);

        var frame = g.append("g")
          .attr('class', 'slider')
          .attr('width', width)
          .attr('height', height);

        frame.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0.5,' + 10.5 + ')')
          .call(axis);

        handle = frame.append('g')
          .attr("class", "brush")
          .attr('transform', 'translate(0.5,' + 5 + ')')
          .call(brush);

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
      return slider;
    };

    slider.extent = function(value) {
      if (!arguments.length) return brush.extent();
      brush.extent(value);
      if (handle) handle.call(brush);
      return slider;
    };

    slider.on = function(type, listener) {
      dispatch.on(type,  listener);
      return slider;
    };

    return slider;
  };
});