/**
 * Created by yarden on 3/27/15.
 */

define(function(require) {

  var model = require('model');
  var d3 = require('d3');

  return function () {
    var root;
    var nodes = d3.map();

    createHierarchy();

    function createHierarchy() {
      var r, c;
      root = {id:'root', parent:undefined, children:[], r:0, angle:0};

      for (r = 0; r<6; r++) {
        var row = {id:r, children:[], parent:root, r:100, angle:r * Math.PI/3};
        for (c = 0; c<16; c++) {
          var col = {id:r*16+c, parent:row, r:200, angle:row.angle+c*Math.PI/(3*16)};
          nodes.set(col.id,  col);
        }
      }
    }


    function layout(links, groupId) {
      var list = [];
      links.forEach(function(link) {
        if (link.srcId.g == groupId) {
          link.source = nodes.get(link.srcId.r*16+link.srcId.c);
          link.target = nodes.get(link.destId.r*16+link.destId.c);
          list.push(link);
        }
      });
      return list;
    }

    return layout;
  };
});