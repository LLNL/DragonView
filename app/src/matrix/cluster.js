/**
 * Created by yarden on 3/15/15.
 */
define(function(require) {

  return function(id) {
    var nodes = new Map(), root = {id: id, open: true};
    var levels = [16, 6, 16];
    var colors = d3.scale.category20();

    function key(id) {
      return root.id+':'+id.g+':'+id.r+':'+id.c;
    }

    function init() {
      build(root, 0);
      for (var i=0; i<root.children.length; i++)
        root.children[i].color = colors(i);
    }

    function build(parent, level) {
      var i, n = levels[level], node;
      parent.children = parent.children || [];
      for(i = 0; i < n; i++) {
        node = {id: parent.id + ':' + i, parent:parent, open: level < levels.length-1};
        nodes.set(node.id, node);
        parent.children.push(node);
        if (level < levels.length - 1) {
          build(node, level + 1);
        }
      }
    }

    function clear(node) {
      node.value = 0;
      node.values = undefined;
      if (node.children)
        node.children.forEach(function(n) { clear(n); });
    }

    function cluster() {
    }

    cluster.clear = function() {
      clear(root);
    };

    cluster.add = function(id, value) {
      var node = nodes.get(key(id)), leaf;
      if (!node.values) node.values = [value];
      else node.values.push(value);

      while (node) {
        if (!node.open) leaf = node;
        node = node.parent;
      }

      return leaf;
    };

    cluster.root = function() {
      return root;
    };

    cluster.nodes = function() {
      return nodes;
    };

    cluster.node = function(id) {
      return nodes.get(key(id));
    };

    cluster.visit = function(func) {
      visit_(root, 0, func);

      function visit_(node, level, func) {
        func(node, level);
        if (node.open) {
          node.children.forEach(function (n) { visit_(n, level+1, func);});
        }
      }
    };

    init();
    return cluster;
  }
});