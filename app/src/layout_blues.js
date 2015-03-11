/**
 * Created by yarden on 3/10/15.
 */
define(function(require) {

  return function() {

    var parms = {
    };

    function init(run) {
      var root = {id:'r', children: {}}

      init(root, run.c)
    }

    function layout(run) {
      run.tree = run.tree || init(run);
    }


    return layout;
  }
};