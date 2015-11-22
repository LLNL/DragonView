/**
 * Created by yarden on 3/5/15.
 */
define(function(require) {
  var Radial = require('radial/radial');
  var Radio = require('radio');

  return function(id_) {
    var id = id_;
    var radial, el, group;
    var active = false, _data, _range, _counter;

    Radio.channel(id).on('data.run', function (data) {
      _data = data;
      if (active) radial.data(data).filter();
    });

    Radio.channel(id).on('data.update', function(data) {
      _data = data;
      if (active) radial.data(data).filter();
    });

    Radio.channel(id).on('counter.range', function (range) {
      _range = range;
      if (active) radial.range(range).filter();
    });

    Radio.channel(id).on('counter.change', function (index) {
      _counter = index;
      if (active) radial.counter(index).filter();
    });

    Radio.channel(id).on('cmap.changed', function() {
      if (active) radial.renderLinks();
    });

    function getSize(el) {
      var d3el = d3.select(el);
      return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
    }

    var view = function(elem) {
      radial = Radial().el(elem).counter(0).resize([600, 600]);

      var win = elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow;
      win.addEventListener('resize', function() {
        radial.resize(getSize(elem));
      });
      win.dispatchEvent(new Event('resize'));

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