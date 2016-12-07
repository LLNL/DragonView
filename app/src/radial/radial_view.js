/**
 * Created by yarden on 3/5/15.
 */
define(function(require) {
  var Radial = require('radial/radial');
  var Radio = require('radio');

  return function(id_) {
    var id = id_;
    var radial, el, group;
    var active = true, _data, _range, _counter;

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
      if (active) radial.cmap_changed();
    });

    Radio.channel(id).on('job.highlight', function(job, on) {
      if (active) radial.highlight_job(job, on);
    });

    Radio.channel(id).on('routers.change', function() {
      if (active) radial.update_routers();
    });

    function getSize(el) {
      var d3el = d3.select(el);
      console.log(
        '\toffset: Top:', d3el.property('offsetTop'),
        'Left:', d3el.property('offsetLeft'),
        'Width:', d3el.property('offsetWidth'),
        'Height:', d3el.property('offsetHeight'),
        'client: Width:', d3el.property('clientWidth'),
        'height:', d3el.property('clientHeight'));
      console.log("\telem: ",parseInt(d3el.style('width')), parseInt(d3el.style('height')));
      return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
    }

    var view = function(elem) {
      radial = Radial().el(elem).counter(0).resize([600, 600])
        .on('active', function(routers) {
          Radio.channel(id).trigger('routers.active', routers);
        });

      var win = elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow;
      win.addEventListener('resize', function(event) {
        var el = d3.select(elem);
        //var s = [event.target.innerWidth-el.property('offsetLeft'), event.target.innerHeight-el.property('offsetTop')];
        var s = [event.target.innerWidth-280, event.target.innerHeight-el.property('offsetTop')];
        radial.resize(s);
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