/**
 * Created by yarden on 7/24/16.
 */

import * as d3 from 'd3';
import config from './config';
import * as pubsub from './utils/pubsub';
import model from './model/data';
import Overview from './components/overview';

let overview = new Overview({ el: '#overview-svg'});


model.load()
  .then(setup);

function setup() {
  setup_runs(model.runs);
  pubsub.publish('db.loaded');
  overview.select_run(model.runs && model.runs.length > 0 ? 0 : -1 );
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
  overview.select_run(i);
}

function post(url, params) {
  return fetch(url, {
    method:'post',
    body: JSON.stringify(parms),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}