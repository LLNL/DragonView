/**
 * Created by yarden on 3/11/15.
 */
define(function(require) {

  var N_GROUPS = 15, N_ROWS = 6, N_COLS = 16, N_PORTS = 40, N_NODES = 4, N_CORES = 24;

  return {
    N_GROUPS: N_GROUPS,
    N_ROWS: N_ROWS,
    N_COLS: N_COLS,
    N_PORTS:N_PORTS,
    N_NODES:N_NODES,
    N_CORES:N_CORES,

    port_id: function(g, r, c, p) { return ((g*N_ROWS + r)*N_COLS + c)*N_PORTS + p; },

    router_id: function(g, r, c) {
      if (arguments.length == 1)
        return (g.g*N_ROWS + g.r)*N_COLS + g.c;
      return (g*N_ROWS + r)*N_COLS + c;
    },

    link_id: function(sg, sr, sc, dg, dr, dc) {
      return sg+':'+sr+':'+sc+'-'+dg+':'+dr+':'+dc;
    },

    node_id: function(g,r,c,n) {
      if (arguments.length == 1)
        return ((g.g*N_ROWS + g.r)*N_COLS + g.c)*N_NODES+ g.n;
      return ((g*N_ROWS + r)*N_COLS + c)*N_NODES+ n;

    },

    core_id:function(item) {
      return (((item.g*N_ROWS + item.r)*N_COLS + item.c)*N_NODES+ item.n)*N_CORES + item.core;
    }
  };
});