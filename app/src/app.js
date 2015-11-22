/**
 * Created by yarden on 1/30/15.
 */

define(function(require) {
  'use strict';


  var radio = require('radio');
  var compare = require('./compare');
  var Run = require('./run');

  var tabs = new Map();

  compare.on('selected', onSelect);
  compare.resize(getSize('#matrix'));

  function onSelect(key) {
    console.log('app:', key);
    var tab = tabs.get(key);
    if (!tab) {
      tab = {window: null, run: Run() };
      tabs.set(key, tab);
    }
    if (!tab.window || tab.window.closed) {
      tab.window = window.open('run.html', key);
      d3.select(tab.window).on('load', function() { tab.run.init(key, tab.window); });
    } else {
      tab.window.focus();
    }
  }

  window.addEventListener('resize', function() {
    compare.resize(getSize('#matrix'));
  });

  function getSize(el) {
    var d3el = d3.select(el);
    return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
  }
});