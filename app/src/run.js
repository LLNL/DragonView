/**
 * Created by yarden on 11/21/15.
 */
define(function(require) {

  var d3 = require('d3');

  var DataService = require('data');
  var ControlsView = require('views');
  var CountersView = require('counters_view');
  var JobsView = require('jobs_view');

  return function() {
    var radialView, countersView, controlsView, jobsView;
    var dataService = DataService;

    var run = function() {};

    run.init = function() {
      countersView = CountersView();
      controlsView = ControlsView();
      jobsView = JobsView();

      Radio.channel('app').trigger('ready');
      return run;
    };

    return run;
  };

});