/**
 * Created by yarden on 1/30/15.
 */

define(function(require) {
  'use strict';

  //var DataService = require('data');
  //var ControlsView = require('views');
  //var CountersView = require('counters_view');
  //var JobsView = require('jobs_view');
  var radio = require('radio');

  var compare = require('compare/compare');
  compare.on('selected', onSelect);
  compare.resize(getSize('#matrix'));


  var runs = new Map();


  function onSelect(key) {
    console.log('app:', key);
    var run = runs.get(key);
    if (!run) {
      run = {window: null};
      runs.set(key, tab);
    }
    if (!run.window || run.window.closed) {
      run.window = window.open('runs.html', 'run');
      //d3.select(run.window).on('load', init);
    } else {
      run.window.focus();
    }
  }

  window.addEventListener('resize', function() {
    compare.resize(getSize('#matrix'));
  });

  function getSize(el) {
    let d3el = d3.select(el);
    return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
  }

  //
  //return function() {
  //  var radialView, countersView, controlsView, jobsView;
  //  var dataService = DataService;
  //
  //  var app = function() {};
  //
  //  app.start = function() {
  //    countersView = CountersView();
  //    controlsView = ControlsView();
  //    jobsView = JobsView();
  //
  //    Radio.channel('app').trigger('ready');
  //    return app;
  //  };
  //
  //  return app;
  //};
});