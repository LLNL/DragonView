/**
 * Created by yarden on 3/5/15.
 */
define(function(require) {
  var Component = require('graph/graph');
  var _ = require('underscore');
  var $ = require('jquery');
  var Resize = require('resize');
  var Radio = require('radio');

  return function(id_) {
    var id = id_;
    var component, el;
    var active = false, _data, _range, _counter;

    Radio.channel(id).on('data.run', function (data) {
      if (active) component.data(data).filter();
      else _data = data;
    });

    Radio.channel(id).on('data.range', function (range) {
      if (active) component.range(range).filter();
      else _range = range;
    });

    Radio.channel(id).on('data.change', function (index) {
      if (active) component.counter(index).filter();
      else _counter = index;
    });

    function onResize() {
      component.resize(el.width(), el.height());
    }

    var view = function(elem) {
      //el = $(elem);
      var div = d3.select(elem).append('div');
      var ctrl = div.append('div').attr('class', 'graph-ctrl').selectAll('input')
        .data(['blue', 'green', 'black', 'all'])
        .enter()
        .append('g');

      ctrl.append('input')
          .attr('type', 'radio')
          .attr('name', 'select-link')
          .attr('value', function(d) { return d;})
          //.text(function(d) {return d;})
          .property('checked', function(d, i) { return i==0; })
          .on('change', function(d) { component.select(d);});

      ctrl.append('label')
            .text(function(d) { return d;});

      var g = div.append('div')[0][0];
      el = $(g);
      component = Component().el(g).counter(0).resize(600, 600);
      el.detectResizing({onResize: onResize});
      return view;
    };

    view.active = function (_) {
      if (!arguments.length) return active;

      if (active != _) {
        active = _;
        if (_data) component.data(_data);
        if (_counter != undefined) component.counter(_counter);
        if (_range) component.range(_range);

        if (_counter != undefined || _range)
          component.filter();

        _data = _range = _counter = undefined;
      }
      return this;
    };

    return view;
  }

});