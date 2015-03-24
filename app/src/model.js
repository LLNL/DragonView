/**
 * Created by yarden on 3/11/15.
 */
define(function(require) {

  var N_GROUPS = 16, N_ROWS = 6, N_COLS = 16, N_PORTS = 40;
  return {
    N_GROUPS: N_GROUPS,
    N_ROWS: N_ROWS,
    N_COLS: N_COLS,
    N_PORTS:N_PORTS,

    port_id: function(g, r, c, p) { return ((g*N_ROWS + r)*N_COLS + c)*N_PORTS + p; },

    router_id: function(g, r, c) {
      if (arguments.length == 1)
        return (g.g*N_ROWS + g.r)*N_COLS + g.c;
      return (g*N_ROWS + r)*N_COLS + c;
    },

    link_id: function(sg, sr, sc, dg, dr, dc) {
      return sg+':'+sr+':'+sc+'-'+dg+':'+dr+':'+dc;
    },

    node_id: function(node) {
      return node.g+':'+node.r+':'+node.c+':'+node.n;
    }
  };
});