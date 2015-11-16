/**
 * Created by yarden on 2/6/15.
 */
define(function(require) {

  var model = require('model');

  return function() {
    var parms = {
        //width: 600,
        //height: 600,
        outerRadius: 500,
        innerRadius: 400,
        connectorsRadius: 300,
        colRadius: 200,
        groupsRadius: 100,

        spaceBetweenGroups: 5,

        outerOffset: 35,
        groupHeight: 35,
        connectorsOffset: 4,

        connectorsHeight: 6,
        connectorSpacing: 0
      };


    function layoutRouters(group) {
      var nrows = group.routers.length;
      var ncols = group.routers[0].length;
      var r=-1, c=-1;
      var dr = (parms.outerRadius - parms.innerRadius)/(nrows+1);
      var da = (group.endAngle - group.startAngle)/(ncols+1);
      var router, row;
      var radius = parms.innerRadius, angle;

      while(++r < nrows) {
        row = group.routers[r];
        radius += dr;
        angle = group.startAngle+da;
        c = -1;
        while (++c < ncols) {
          router = row[c];
          router.radius = radius;
          router.angle = angle;
          angle += da;
        }
      }
    }

    function layoutGroups(groups) {
      var ng, total,
        angleBetweenGroups, da, angle;

      total = 0;
      groups.forEach(function(g) {
        g.len = 16;
        total += g.len;
      });

      angleBetweenGroups = parms.spaceBetweenGroups/parms.innerRadius;
      da = (2*Math.PI - groups.length * angleBetweenGroups)/total;

      angle = angleBetweenGroups/2;
      groups.forEach(function(group) {
        group.startAngle = angle;
        group.endAngle = angle + group.len * da;

        layoutRouters(group);

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
      run.blueRoutes.r = 0;
      run.blueRoutes.angle = 0;
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
            var router = {id: group.id+':'+r+':'+c, parent: col, router:run.routers.get(model.router_id(group.id,  r, c))};
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

    layout.size = function(r) {
      parms.outerRadius = r - parms.outerOffset;
      parms.innerRadius = parms.outerRadius - parms.groupHeight;
      parms.connectorsRadius = parms.innerRadius-parms.connectorsOffset;
      parms.colRadius = parms.connectorsRadius * 0.75;
      parms.groupsRadius = parms.connectorsRadius * 0.5;

      return layout;
    };

    layout.parms = function() {
      return parms;
    };

    return layout;
  };
});
