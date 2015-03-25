/**
 * Created by yarden on 3/12/15.
 */
define(function(require) {
  var d3 = require('d3');
  var RadialView = require('radial/radial_view');
  var MatrixView = require('matrix/matrix_view');

  var views = [
    {id:'radial', factory: RadialView, view:undefined},
    {id:'matrix', factory: MatrixView, view:undefined}
  ];

  var current  = views[0];

  function select(item) {
    var selected = item || this.value;
    current = selected;
    d3.selectAll('.view')
      .style('display', function(d) { return d.id == selected.id ? 'block' : 'none'; });

    views.forEach(function(v) {
      var active = v.id == selected.id;
      if (active) {
        v.view = v.view || v.factory();
        v.view.active(true);
      } else {
        if (v.view) v.view.active(false);
      }
    })
  }



  var view = function() {

    d3.select('#views').selectAll('.view')
        .data(views)
      .enter()
        .append('div')
        .attr('id', function(d) { return d.id;})
        .classed('view', true)
        .style('display', 'none')
        .each(function(d) {d.view = d.factory()});

    var i = d3.select('#viewSelectors').selectAll('input')
              .data(views)
            .enter()
            .append('g');

    i.append('input')
        .attr('type', 'radio')
        .attr('name', 'view')
        .attr('value', function(d) {return d.id;})
        .on('change', select)
        .property('checked', function(d) { return this.value == current.id;});

    i.append('label')
     .text(function(d) { return d.id;})
     .append('br');

    select(current);
  };

  return view;
});