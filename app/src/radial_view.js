/**
 * Created by yarden on 3/5/15.
 */
define(function(require) {
  var Radial = require('radial');
  var Radio = require('radio');
  var $ = require('jquery');
  var _ = require('underscore');
  //var Resize = require('resize');

  return function() {
    var radial;
    var active = true, _data, _range, _counter;

    //_.bindAll(this, 'onResize');

    Radio.channel('data').on('change', function (data) {
      if (active) radial.data(data).update();
      else _data = data;
    });

    Radio.channel('counter').on('range', function (range) {
      if (active) radial.filter(range);
      else _range = range;
    });

    Radio.channel('counter').on('change', function (index) {
      if (active) radial.counter(index);
      else _counter = index;
    });

    radial = Radial().el('#radial')
      .counter(14);

    //this.$el.detectResizing({onResize: this.onResize});

    var view = function () {}

    view.active = function (_) {
      if (!arguments.length) return active;

      if (active != _) {
        active = _;
        if (_data) radial.data(_data).update();
        if (_counter) radial.counter(_counter);
        if (_range) radial.filter(_range);

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