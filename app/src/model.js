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
    blueId: function(g, r, c, p) { return ((g*N_ROWS + r)*N_COLS + c)+N_PORTS + p; }
  };
});