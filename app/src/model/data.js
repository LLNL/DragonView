/**
 * Created by yarden on 7/25/16.
 */


let _dragonfly = {};
let _runs = {};
let _counters = {};



function counter(r, t, c) {
  let key = `${r}:${t}:${c}`;

  return _counters[key] || (_counters[key] = post('/data/counter', {run:r, timestep: t, counter:c}));
}


function load() {
  let d = {};
  let r = {};

  return Promise.all([
    fetch('/info/machine')
      .then( response => response.json() )
      .then( data => {
        Object.assign(d, data);
        d.n_groups = +d.n_groups;
        d.n_rows = +d.n_rows;
        d.n_cols = +d.n_cols;
        d.n_nodes = +d.n_nodes;
      }),

    fetch('/info/links')
      .then( response => response.json())
      .then( links => d.links = links ),

    fetch('/info/names')
      .then( response => response.json() )
      .then( names => d.names = names),

    fetch('/info/runs')
      .then( response => response.json() )
      .then( runs => r = runs)

  ]).then(() => setup(d,r));
}

function setup(d, r) {
  _dragonfly = d;
  _runs = r;
  _counters = {};
  return _runs;
}

function post(url, params) {
  return fetch(url, {
      method:'post',
      body: JSON.stringify(params),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then( response => response.json());
}

export default {
  load() { return load(); },

  get runs() { return _runs; },
  get dragonfly() { return _dragonfly; },

  counter(run_id, timestep, name) { return counter(run_id, timestep, name);}
}