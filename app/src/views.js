/**
 * Created by yarden on 3/12/15.
 */
define(function(require) {
  var d3 = require('d3');
  var RadialFactory = require('radial/radial_view');
  var MatrixFactory = require('matrix/matrix_view');
  var GraphFactory = require('graph/graph_view');

  var views = [
    {id:'radial', factory: RadialFactory, view:undefined},
    {id:'matrix', factory: MatrixFactory, view:undefined},
    {id:'graph',  factory: GraphFactory, view:undefined }
  ];

  var view = function() {
    d3.select('.views').select(".tab-links").selectAll("li")
      .data(views)
      .enter()
        .append('li')
          .classed('active', function(d,i) { return i==0;})
        .append('a')
          .attr('href', function(d) {return '#'+d.id;})
          .text(function(d) { return d.id;})
          .on('click', function(d) {
              d3.select('.views').selectAll('.tab')
                .data(views)
                .classed('active', function(tab) { return tab.id == d.id; })
                .each(function(tab) { tab.view.active(tab.id == d.id); });
              d3.event.preventDefault();
          });

    d3.select('.views').select('.tab-content').selectAll("div")
      .data(views)
      .enter()
        .append('div')
        .attr('id', function(d) { return d.id;})
        .attr('class', function(d, i) { return 'tab'+(i==0? ' active' : ''); })
        .each(function(d, i) {
          d.view = d.factory();
          var a = d.view(this);
          d.view.active(i==0);});
  };

  return view;
});