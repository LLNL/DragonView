/**
 * Created by yarden on 3/11/15.
 */
define(function(require) {

  // var N_GROUPS = 2, N_ROWS = 6, N_COLS = 16, N_PORTS = 40, N_NODES = 4, N_CORES = 24;
  //
  // function port_id(g, r, c, p) { return ((g*N_ROWS + r)*N_COLS + c)*N_PORTS + p; }
  //
  // function router_id(g, r, c) {
  //   if (arguments.length == 1)
  //     return (g.g*N_ROWS + g.r)*N_COLS + g.c;
  //   return (g*N_ROWS + r)*N_COLS + c;
  // }
  //
  // function link_id(sg, sr, sc, dg, dr, dc) {
  //   return sg+':'+sr+':'+sc+'-'+dg+':'+dr+':'+dc;
  // }
  //
  // function node_id(g,r,c,n) {
  //   if (arguments.length == 1)
  //     return ((g.g*N_ROWS + g.r)*N_COLS + g.c)*N_NODES+ g.n;
  //   return ((g*N_ROWS + r)*N_COLS + c)*N_NODES+ n;
  //
  // }
  //
  // function core_id(item) {
  //   return (((item.g*N_ROWS + item.r)*N_COLS + item.c)*N_NODES+ item.n)*N_CORES + item.core;
  // }
  //
  // function set_ngroups(n) { N_GROUPS = n;}

  return {
    N_GROUPS: 0,
    N_ROWS: 6,
    N_COLS: 16,
    N_PORTS: 40,
    N_NODES:  4,
    N_CORES: 24,

    port_id: function(g, r, c, p) { return ((g*this.N_ROWS + r)*this.N_COLS + c)*this.N_PORTS + p; },

    router_id: function(g, r, c) {
      if (arguments.length == 1)
        return (g.g*this.N_ROWS + g.r)*this.N_COLS + g.c;
      return (g*this.N_ROWS + r)*this.N_COLS + c;
    },

    link_id: function(sg, sr, sc, dg, dr, dc) {
      return sg+':'+sr+':'+sc+'-'+dg+':'+dr+':'+dc;
    },

    node_id: function(g,r,c,n) {
      if (arguments.length == 1)
        return ((g.g*this.N_ROWS + g.r)*this.N_COLS + g.c)*this.N_NODES+ g.n;
      return ((g*this.N_ROWS + r)*this.N_COLS + c)*this.N_NODES+ n;

    },

    core_id:function(item) {
      return (((item.g*this.N_ROWS + item.r)*this.N_COLS + item.c)*this.N_NODES+ item.n)*this.N_CORES + item.core;
    },

    set_ngroups: function(n) { this.N_GROUPS = n;}
  };
});