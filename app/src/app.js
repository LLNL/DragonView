/**
 * Created by yarden on 1/30/15.
 */

define(function(require) {
  'use strict';

  var DataService = require('data');
  var ControlsView = require('views');
  var CountersView = require('counters_view');
  var JobsView = require('jobs_view');
  var Radio = require('radio');

  return function() {
    var radialView, countersView, controlsView, jobsView;
    var dataService = DataService;

    var app = function() {};

    app.start = function() {
      countersView = CountersView();
      controlsView = ControlsView();
      jobsView = JobsView();

      Radio.channel('app').trigger('ready');
      return app;
    };

    return app;
  };
});