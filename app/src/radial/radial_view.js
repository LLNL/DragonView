/**
 * Created by yarden on 3/5/15.
 */
define(function(require) {
  var Radial = require('radial/radial');
  var _ = require('underscore');
  var $ = require('jquery');
  var Resize = require('resize');
  var Radio = require('radio');

  return function() {
    var radial, el, group;
    var active = false, _data, _range, _counter;

    Radio.channel('data').on('run', function (data) {
      _data = data;
      if (active) radial.data(data).filter();
    });

    Radio.channel('data').on('update', function(data) {
      _data = data;
      if (active) radial.data(data).filter();
    });

    Radio.channel('counter').on('range', function (range) {
      _range = range;
      if (active) radial.range(range).filter();
    });

    Radio.channel('counter').on('change', function (index) {
      _counter = index;
      if (active) radial.counter(index).filter();
    });

    function onResize() {
      radial.resize(el.width(), el.height());
    }

    var view = function(elem) {
      el = $(elem);
      radial = Radial().el(elem).counter(0).resize(600, 600);

      el.detectResizing({onResize: onResize});
      return view;
    };

    view.active = function (_) {
      if (!arguments.length) return active;

      if (active != _) {
        active = _;
        if (active) {
          if (_data) radial.data(_data);
          if (_counter != undefined) radial.counter(_counter);
          if (_range) radial.range(_range);

          if (_counter != undefined || _range)
            radial.filter();

          _data = _range = _counter = undefined;
        }
      }

      return this;
    };

    return view;
  }

});