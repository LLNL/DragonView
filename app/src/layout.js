/**
 * Created by yarden on 2/6/15.
 */
define(function(require) {

  return function() {
    var parms = {
        width: 1000,
        height: 1000,
        outerRadius: 500,
        innerRadius: 400,
        connectorsRadius: 300,
        colRadius: 200,
        groupsRadius: 100,

        spaceBetweenGroups: 5,

        outerOffset: 10,
        groupHeight: 100,
        connectorsOffset: 4,

        connectorsHeight: 6,
        connectorSpacing: 0
      };


    function layoutGroups(groups) {
      var ng, total,
        angleBetweenGroups, dAngle,
        angle, connector;

      total = 0;
      ng = 0;
      groups.forEach(function(g) {
        ng++;
        g.len = 16;
        total += g.len;
      });

      angleBetweenGroups = parms.spaceBetweenGroups/parms.innerRadius;
      dAngle = (2*Math.PI - ng*angleBetweenGroups)/total;

      angle = angleBetweenGroups/2;
      groups.forEach(function(group) {
        group.startAngle = angle;
        group.endAngle = angle + group.len*dAngle;

        angle = group.endAngle + angleBetweenGroups;
      });
    }

    function assign(node, from, span, r, depth) {
      node.r = r[depth];
      node.angle = from+span/2;
      if (node.children) {
        var n = node.children.length;
        var da = span/node.children.length;
        for (var i=0; i<n; i++) {
          assign(node.children[i], from + da*i, da, r, depth+1);
        }
      }
    }
    function layoutBlueRouting(run) {
      var r = [parms.groupsRadius, parms.colRadius, parms.connectorsRadius];
      run.blueRoutes.children.forEach(function(node) {
        var group = node.item;
        assign(node, group.startAngle, group.endAngle-group.startAngle, r, 0);
      });
    }

    function createBlueRouting(run) {
      run.blueRoutes = {id:'root', children:[], nodes: []};
      run.groups.forEach(function(group) {
        var node = {id:group.id, parent: run.blueRoutes, children:[], item:group};
        var nrows = group.routers.length;
        var ncols = group.routers[0].length;
        for (var c=0; c<ncols; c++) {
          var col = {id: group.id+':'+c, parent: node, children: []};
          for (var r=0; r<nrows; r++) {
            var router = {id: group.id+':'+c+':'+r, parent: col};
            col.children.push(router);
            run.blueRoutes.nodes.push(router);
          }
          node.children.push(col);
          run.blueRoutes.nodes.push(col);
        }
        run.blueRoutes.children.push(node);
        run.blueRoutes.nodes.push(node);
      });
    }

    function layout(run) {
      layoutGroups(run.groups);
      if (!run.blueRoutes) createBlueRouting(run);
      layoutBlueRouting(run);

    }

    layout.size = function(s) {
      var r = Math.min(s[0], s[1])/2;
      parms.width = s[0];
      parms.height = s[1];
      parms.outerRadius = r - parms.outerOffset;
      parms.innerRadius = parms.outerRadius - parms.groupHeight;
      parms.connectorsRadius = parms.innerRadius-parms.connectorsOffset;

      return layout;
    };

    layout.parms = function() {
      return parms;
    };

    return layout;
  };
});