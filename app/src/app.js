/**
 * Created by yarden on 7/24/16.
 */

import * as d3 from 'd3';
import config from './config';
import * as pubsub from './utils/pubsub';
import model from './model/data';
import Overview from './panels/overview';
import Groups from './components/groups';

let groups = Groups();
let overview = Overview();

d3.select('#groups').call(groups);
d3.select('#overview').call(overview);

model.load()
  .then(setup);

function setup() {
  setup_runs(model.runs);
  pubsub.publish('db.loaded');

  let run = model.runs[0];
  groups.run(run, run.start, model.dragonfly.names[0]);
}

function setup_runs(runs) {

  d3.select('#runs').selectAll('.option')
    .data(runs)
    .enter().append('option')
      .attr('value', function (d, i) { return i; })
      .text(function (d) { return d.name; });

  d3.select('#run')
    .property('value', 0)
    .on('change', function() { select_run(this.value);});
}

function select_run(idx) {
  // overview.select_run(i);
}
