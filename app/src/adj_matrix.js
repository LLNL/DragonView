/**
 * Created by yarden on 3/12/15.
 */
define(function(require) {

  var d3 = require('d3');

  return function() {
    var WIDTH = 1000, HEIGHT = 1000;
    var svgContainer, svg;
    var data, range, counterId;
    var routers;
    var left, top;

    function initRouters() {
      var router;
      routers = new Map();

      data.counters.forEach(function(counter) {
        router = routers.get(counter.id);
        if (!router) {
          router = {id:counter.id, counters: []};
          routers.set(counter.id, router);
        }
        router.counters.push(counter);
      });
    }

    function init() {
      var r;

      initRouters();
      left = [];
      top = [];
      for (r of routers.values()) {

      }

    }

    function render() {

    }

    function filter() {

    }

    var adj = function() {};

    adj.el = function(el) {
      svgContainer = d3.select(el)
        .classed("adjMatrix", true)
        .append("svg")
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

      svg = svgContainer.append("g");

      return this;
    };

    adj.resize = function(w, h) {
      svgContainer.attr("width", w).attr("height", h);
      //layout.size(w, h);
      render();
      return this;
    };

    adj.data = function(_) {
      if (!arguments.length) return data;
      data = _;
      //layout(data);
      render();
      return this;
    };

    adj.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      return this;
    };

    adj.filter = function(_) {
      if (!arguments.length) return range;
      range = _;
      filter();
      return this;
    };

    adj.update = function() {
      render();
      return this;
    };

    adj.counter = function(_) {
      if (!arguments.length) return counterId;
      counterId = _;
      if (data) filter();
      return this;
    };

    return adj;
  }
});