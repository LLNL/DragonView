/**
 * Created by yarden on 3/12/15.
 */
define(function(require) {
  var AdjMatrix = require('matrix/adj_matrix');
  var Radio = require('radio');
  var $ = require('jquery');
  var _ = require('underscore');
  //var Resize = require('resize');

  return function(id_) {
    var id = id_;
    var component, el;
    var active = false, _data, _range, _counter;

    Radio.channel(id).on('data.run', function (data) {
      if (active) component.data(data).update();
      else _data = data;
    });

    Radio.channel(id).on('counter.range', function (range) {
      if (active) component.range(range).update();
      else _range = range;
    });

    Radio.channel(id).on('counter.change', function (index) {
      if (active) component.counter(index).update();
      else _counter = index;
    });


    function onResize() {
      console.log('w:', el.width(), 'h:', el.height());
      component.resize(el.width(), el.height());
    }

    var view = function (elem) {
      el = $(elem);
      component = AdjMatrix().el(elem).counter(14);
      //el.detectResizing({onResize: onResize});
    };

    view.active = function (_) {
      if (!arguments.length) return active;

      if (active != _) {
        active = _;
        if (_data) component.data(_data);
        if (_counter != undefined) component.counter(_counter);
        if (_range) component.range(_range);

        if (_data || _counter != undefined || _range)
          component.update();

        _data = _range = _counter = undefined;
      }

      return this;
    };



    return view;
  }

});