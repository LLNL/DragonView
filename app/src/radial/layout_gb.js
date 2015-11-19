/**
 * Created by yarden on 3/27/15.
 */

define(function(require) {

  var model = require('model');
  var d3 = require('d3');

  return function () {
    var innerRadius = 100, outerRadius = 200;;
    var root, nodes = d3.map();

    createHierarchy();

    function createHierarchy() {
      var r, c;
      root = {id:'root', parent:undefined, children:[], r:0, angle:0};

      for (r = 0; r<model.N_ROWS; r++) {
        var row = {id:r, children:[], parent:root, r:innerRadius, angle:r * Math.PI/3};
        root.children.push(row);
        for (c = 0; c<model.N_COLS; c++) {
          var col = {id:r*model.N_COLS+c, parent:row, r:outerRadius, angle:row.angle+c*Math.PI/(3*model.N_COLS)};
          row.children.push(col);
          nodes.set(col.id,  col);
        }
      }
    }

    function updateHierarchy() {
      var r, c;

      for (r = 0; r<model.N_ROWS; r++) {
        var row = root.children[r];
        row.r = innerRadius;
        for (c = 0; c<model.N_COLS; c++) {
          row.children[c].r = outerRadius;
        }
      }
    }

    function layout(links, groupId) {
      var list = [];
      links.forEach(function(link) {
        if (link.srcId.g == groupId) {
          link.source = nodes.get(link.srcId.r*model.N_COLS+link.srcId.c);
          link.target = nodes.get(link.destId.r*model.N_COLS+link.destId.c);
          list.push(link);
        }
      });
      return list;
    }

    layout.nodes = function() {
      return nodes.values();
    };

    layout.root = function() {
      return root;
    };

    layout.size = function(size) {
      if (!arguments.length) return [innerRadius, outerRadius];
      innerRadius = size[0];
      outerRadius = size[1];
      updateHierarchy();
      return this;
    };

    return layout;
  };
});