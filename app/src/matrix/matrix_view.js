/**
 * Created by yarden on 3/12/15.
 */
define(function(require) {
  var AdjMatrix = require('matrix/adj_matrix');
  var Radio = require('radio');
  var $ = require('jquery');
  var _ = require('underscore');
  //var Resize = require('resize');

  return function() {
    var component;
    var active = false, _data, _range, _counter;

    //_.bindAll(this, 'onResize');

    Radio.channel('data').on('change', function (data) {
      if (active) component.data(data).update();
      else _data = data;
    });

    Radio.channel('counter').on('range', function (range) {
      if (active) component.filter(range);
      else _range = range;
    });

    Radio.channel('counter').on('change', function (index) {
      if (active) component.counter(index);
      else _counter = index;
    });

    component = AdjMatrix().el('#matrix')
      .counter(14);

    //this.$el.detectResizing({onResize: this.onResize});

    var view = function () {};

    view.active = function (_) {
      if (!arguments.length) return active;

      if (active != _) {
        active = _;
        if (_data) component.data(_data).update();
        if (_counter) component.counter(_counter);
        if (_range) component.filter(_range);

        _data = _range = _counter = undefined;
      }

      return this;
    };

    view.onResize = function () {
      console.log('on resize');
    };

    return view;
  }

});