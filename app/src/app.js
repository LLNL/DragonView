/**
 * Created by yarden on 1/30/15.
 */

define(function(require) {
  'use strict';


  var radio = require('radio');
  var compare = require('./compare');
  var Ran = require('./ran');

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
      tab.window = window.open('tab.html', 'tab');
      d3.select(tab.window).on('load', run.init);
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