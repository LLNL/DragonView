/**
 * Created by yarden on 1/30/15.
 */

define(function(require) {
  'use strict';

  var DataService = require('data');
  var RadialView = require('radial_view');
  var CountersView = require('counters_view');
  var test = require('data1');

  return function() {
    var radialView, countersView;
    var dataService = DataService();

    var app = function() {};

    app.start = function() {
      radialView = RadialView();
      countersView = CountersView();

      dataService.start();
      return app;
    };

    return app;
  };
});