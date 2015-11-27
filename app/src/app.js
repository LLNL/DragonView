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
  window.addEventListener('resize', function() {
    var s = getSize('#outer');
    compare.resize([s[0]-200, s[1]]);
  });


  window.dispatchEvent(new Event('resize'));

  function onSelect(selection) {
    var tab = tabs.get(selection.key);
    if (!tab) {
      tab = {window: null, run: Run() };
      tabs.set(selection.key, tab);
    }
    if (!tab.window || tab.window.closed) {
      tab.window = window.open('run.html', selection.key);
      d3.select(tab.window).on('load', function() { tab.run.init(selection, tab.window); });
    } else {
      tab.window.focus();
    }
  }



  function getSize(el) {
    var d3el = d3.select(el);
    return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
  }
});

//function loadTemplate(tid, eid) {
//  var t = importDoc.querySelector(tid);
//  var clone = document.importNode(t.content, true);
//  var d = document.getElementsByTagName(eid);
//  d[0].appendChild(clone);
//}
//loadTemplate('#compare-template', name);