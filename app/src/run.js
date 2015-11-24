/**
 * Created by yarden on 11/21/15.
 */
define(function(require) {

  var d3 = require('d3');
  var radio = require('radio');

  var DataService = require('data');
  var ControlsView = require('views');
  var CountersView = require('counters_view');
  var JobsView = require('jobs_view');

  return function() {
    var id;
    var localWindow;
    var radialView, countersView, controlsView, jobsView;
    var dataService = DataService;

    return {
      init: function (selection, _win) {
        id = selection.key;
        localWindow = _win;

        countersView = CountersView(id, localWindow.document, selection.sims);
        controlsView = ControlsView(id, localWindow.document);
        jobsView = JobsView(id, localWindow.document);

        radio.channel(id).trigger('app.ready');
        return this;
      }
    };
  };
});