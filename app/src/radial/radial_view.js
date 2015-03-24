/**
 * Created by yarden on 3/5/15.
 */
define(function(require) {
  var Radial = require('radial/radial');
  var Radio = require('radio');
  var $ = require('jquery');
  var _ = require('underscore');
  var Resize = require('resize');

  return function() {
    var radial;
    var active = true, _data, _range, _counter;

    //_.bindAll(this, 'onResize');

    Radio.channel('data').on('change', function (data) {
      if (active) radial.data(data);
      else _data = data;
    });

    Radio.channel('counter').on('range', function (range) {
      if (active) radial.range(range).filter();
      else _range = range;
    });

    Radio.channel('counter').on('change', function (index) {
      if (active) radial.counter(index).filter();
      else _counter = index;
    });

    radial = Radial().el('#radial')
      .counter(0)
      .resize(600, 600);

    $('#radial').detectResizing({onResize: onResize});

    function onResize() {
      //var e = d3.select('#radial');
      //console.log('radial:',e);
      var e1 = $('#radial');
      console.log('$:', e1.width(), e1.height());
      radial.resize(e1.width(), e1.height());
    }

    var view = function () {};

    view.active = function (_) {
      if (!arguments.length) return active;

      if (active != _) {
        active = _;
        if (_data) radial.data(_data);
        if (_counter != undefined) radial.counter(_counter);
        if (_range) radial.range(_range);

        if (_counter != undefined || _range)
          radial.filter();

        _data = _range = _counter = undefined;
      }

      return this;
    };



    return view;
  }

});