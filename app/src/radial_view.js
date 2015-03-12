/**
 * Created by yarden on 3/5/15.
 */
define(function(require) {
  var Radial = require('radial');
  var Radio = require('radio');
  var $ = require('jquery');
  var _ = require('underscore');
  //var Resize = require('resize');

  var radial;

  var view = function() {
    //_.bindAll(this, 'onResize');

    Radio.channel('data').on('change', function(data) {
      radial.data(data).update();
    });

    Radio.channel('counter').on('range', function(range) {
      radial.filter(range);
    });

    Radio.channel('counter').on('change', function(index) {
      radial.counter(index);
    });

    radial = Radial().el('#radial').counter(14);
    //this.$el.detectResizing({onResize: this.onResize});
  };

  view.onResize = function() {
    console.log('on resize');
  };

  return view;

});