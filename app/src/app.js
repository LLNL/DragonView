/**
 * Created by yarden on 1/30/15.
 */

define(function(require) {
  'use strict';

  var DataService = require('data');
  var ControlsView = require('controls_view');
  var CountersView = require('counters_view');

  return function() {
    var radialView, countersView, controlsView;
    var dataService = DataService();

    var app = function() {};

    app.start = function() {
      countersView = CountersView();
      controlsView = ControlsView();

      dataService.start();
      return app;
    };

    return app;
  };
});