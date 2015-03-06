/**
 * Created by yarden on 2/6/15.
 */
define(function(require) {

  return function() {
    var parms = {
        width: 1000,
        height: 1000,
        innerRadius: 400,
        outerRadius: 500,
        connectorsRadius: 0,
        groupsRadius: 200,
        routersRadius: 300,
        outerOffset: 10,
        groupHeight: 100,
        connectorsHeight: 6,
        connectorsOffset: 4,
        connectorSpacing: 0
      },
      close_angle = 2*Math.PI * 5/360.0;

    function layout(groups) {
      var ng = 0, n_open=0,
        group,
        open_angle, offsetAngle = 5 /parms.innerRadius,
        g, angle, connector;

      var n = groups.length;
      for (g=0; g<n; g++) {
        group = groups[g];
        if (!group) continue;
        ng++;
        if (group.open)
          n_open++;
      }

      open_angle = n_open == 0 ? close_angle : (2*Math.PI - (ng-n_open)*close_angle - ng*offsetAngle)/n_open;

      angle = offsetAngle/2;
      for (g=0; g<n; g++) {
        group = groups[g];
        if (!group) continue;

        group.startAngle = angle;
        group.endAngle = angle + (group.open? open_angle : close_angle);

        var nc = group.connectors.length;
        var da = (group.endAngle - group.startAngle - (nc-1) * parms.connectorSpacing)/nc;
        var connectorAngle = group.startAngle;
        var mid;
        for (var c=0; c<nc; c++) {
          connector = group.connectors[c];
          connector.startAngle = connectorAngle;
          connector.endAngle = connectorAngle+da;
          connectorAngle += da + parms.connectorSpacing;
          mid = (connector.startAngle+connector.endAngle)/2;
          connector.x = parms.connectorsRadius * Math.cos(mid);
          connector.y = parms.connectorsRadius * Math.sin(mid);
        }
        angle = group.endAngle + offsetAngle;
      }
    }

    layout.size = function(s) {
      var r = Math.min(s[0], s[1])/2;
      parms.width = s[0];
      parms.height = s[1];
      parms.outerRadius = r - parms.outerOffset;
      parms.innerRadius = parms.outerRadius - parms.groupHeight;
      parms.connectorsRadius = parms.innerRadius-parms.connectorsOffset-parms.connectorsHeight;
      parms.connectorSpacing = 1.0/parms.connectorsRadius;

      return layout;
    };

    layout.parms = function() {
      return parms;
    };

    return layout;
  };
});