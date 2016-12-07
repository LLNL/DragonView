/**
 * Created by yarden on 11/10/15.
 */

define(function(require) {

  var d3 = require('d3');
  var config = require('config');
  var cmap = require('cmap')();
  var swath = require('components/cmap_swath')();

  var width = 200, height = 200;

  var fields = {
    config:  {name: 'config',  type: 'category', values: [], sort: configSort,   selected: new Set(), init: function(v) { return true;} },
    dataset: {name: 'dataset', type: 'category', values: [], sort: d3.ascending, selected: new Set(), init: function(v) { return true;}},
    sim:     {name: 'sim',     type: 'category', values: [], sort: simSort,      selected: new Set(), init: function(v) { return true;}},
    jobid:   {name: 'jobid',   type: 'category', values: [], sort: d3.ascending, selected: new Set(), init: function(v) { return v == 0;}},
    color:   {name: 'color',   type: 'fixed',    values: ['T', 'b', 'g', 'k'],   selected: new Set(['b', 'g', 'k']), init: function(v) { return v != 'T';}}
  };

  // TODO: use keys based on data. Issue: how to determine which fields are measure and which are categories/dimensions
  var measureFields = ['min', 'avg', 'max', 'nzavg'];

  var functions = {
    min: d3.min,
    max: d3.max,
    avg: d3.mean
  };

  var specs = [
    {
      name: 'config / dataset, sim',
      rows: [fields.config],
      cols: [fields.dataset, fields.sim]
    },
    {
      name: 'config, color / dataset, sim',
      rows: [fields.config, fields.color],
      cols: [fields.dataset, fields.sim]
    },
    {
      name: 'color, config / dataset, sim',
      rows: [fields.color, fields.config],
      cols: [fields.dataset, fields.sim]
    },
    {
      name: 'color, config / dataset, sim, jobid',
      rows: [fields.color, fields.config],
      cols: [fields.dataset, fields.sim, fields.jobid]
    },
    {
      name: 'config,dataset / color,sim',
      rows: [fields.config, fields.dataset],
      cols: [fields.color, fields.sim]
    },
    {
      name: 'config / sim',
      rows: [fields.config],
      cols: [fields.sim]
    },
    {
      name: 'config,sim / dataset,jobid',
      rows: [fields.config, fields.sim],
      cols: [fields.dataset, fields.jobid]
    },
    {
      name: 'config,dataset,sim / color,jobid',
      rows: [fields.config, fields.dataset, fields.sim],
      cols: [fields.color, fields.jobid]
    },
    {
      name: 'config,dataset / sim,color,jobid',
      rows: [fields.config, fields.dataset],
      cols: [fields.sim, fields.color, fields.jobid]
    },
    {
      name: 'dataset,sim / config',
      rows: [fields.dataset, fields.sim],
      cols: [fields.config]
    },
    {
      name: 'color,dataset, sim / config',
      rows: [fields.color, fields.dataset, fields.sim],
      cols: [fields.config]
    },
    {
      name: 'config / color,dataset,sim',
      rows: [fields.config],
      cols: [fields.color, fields.dataset, fields.sim]
    } ,
    {
      name: 'color/ dataset,sim',
      rows: [fields.color],
      cols: [fields.dataset, fields.sim]
    }  ];


  var data = null;
  var active = [];
  var mat;
  var valueSelector = 'max';
  var functionSelector = 'max';
  var spec;
  var dispatch = d3.dispatch('selected');
  var frozen = false;

  var filterValues = {};

  var format = d3.format('6.1f');

  d3.select('#freeze')
    .on('change', function() {
      frozen = this.checked;
      d3.select("#data-reset")
        .property('disabled', frozen);
    });

  d3.select("#data-reset")
    .on('click', function() {
      adjustColormap();
      render(mat);
      d3.select('#cmap_field').text(d3.select('#select-values').property('value'));
    });

  var swath_size = 135;
  swath
    .horizontal(true)
    .colors(cmap.colors())
    .size(swath_size)
    .on('changed', function(f) {
      update_cmap(f);
    });

  d3.select('#cmap')
    .call(swath);

  function update_cmap(f) {
    var range = cmap.value_range();
    var min = range[0];
    var max = range[2];
    var mid = min + f * (max -min);
    d3.select('#cmap_mid').text(format(mid));
    cmap.value_range([min, mid, max]);
    render(mat);
  }

  var re = /(\d+)?(.*)/;

  function configSort(a, b) {
    var l = a.match(re);
    var r = b.match(re);
    var sign = +l[1] - +r[1];
    return sign == 0 ? l[2] < r[2] : sign;
  }

  function simSort(a,b) {
    a = +a.slice(3);
    b = +b.slice(3);
    return a -b;
  }

  d3.select('#select-options')
    .on('change', function (d) { spec = specs[d3.select(this).property('selectedIndex')]; recompute(); })
    .selectAll('option')
    .data(specs)
    .enter()
      .append('option')
      .attr('value', function(d) {return d.name;})
      .text(function(d) { return d.name;});

  d3.select('#select-function')
    .on('change', selectFunction)
    .selectAll('option')
    .data(Object.keys(functions))
    .enter()
      .append('option')
      .attr('value', function(d) { return d; })
      .text(function(d) { return d; });

  d3.select('#select-function')
    .property('value', 'max');


  d3.select("#frame").on('scroll', function(d) {
    d3.select('#rows')[0][0].scrollTop = this.scrollTop;
    d3.select('#columns')[0][0].scrollLeft = this.scrollLeft;
  });

d3.csv('/data/alldata.csv')
  .row(function(d) {
    //d.jobid = +d.jobid;
    //d.color =   fields.color.values[d.color];
    d.min = +d.min;
    d.avg = +d.avg;
    d.max = +d.max;
    d.nonzero = +d.nonzero;
    d.navg = +d.navg;
    return d;
  })
  .get(function(error, rows) {
    if (error) {
      // TODO: better error message notification
      console.err(error);
    }
    else {
      d3.select('#size').text(rows.length);
      if (rows.length == 0) {
        // TODO: better message notification
        console.log('empty dataset');
        return;
      }
      data = rows;

      d3.select('#select-values')
        .on('change', selectValue)
        .selectAll('option')
        .data(measureFields)
        .enter()
          .append('option')

        .attr('value', function(d) {return d;})
        .text(function(d) { return d;});

      // init selection and render
      valueSelector = 'max';
      d3.select('#select-values')
        .property('value', valueSelector);

      d3.select('#cmap_field').text(valueSelector);
      setupFields();
      spec = specs[0];
      filter();
    }
  });

  function setupFields() {
    collectValues(data);

    var li = d3.select('#info #fields').selectAll('li')
      .data(Object.keys(fields))
      .enter()
      .append('li');

    li.append('input')
      .attr('type', 'checkbox')
      .attr('id', function(d) { return d+'-checkbox'})
      .property('name', function(d) {return d;})
      .property('checked', function(d) { return fields[d].selected.size > 0;})
      .property('indeterminate', function(d) { return fields[d].selected.size < fields[d].values.length;})
      .on('change', function(d) {
        var checked = d3.select(this).property('checked');
        d3.select(this.parentElement).select('ul').selectAll('input')
          .property('checked', checked);
        if (checked) {
          fields[d].selected = new Set(fields[d].values);
        } else {
          fields[d].selected = new Set();
        }
        filter();
      });

    li.append('label')
      .attr('class', 'field-title')
      .text(function(d) {return d;});

    var entry = li.append('ul')
      .attr('class', 'values')
      .selectAll('li')
      .data(function(d) { return fields[d].values.map(function(v) { return [fields[d].name, v];});})
      .enter()
        .append('li')
        .attr('class', 'value');


    entry
      .append('input')
      .attr('type', 'checkbox')
      .property('name', function(d) {return d[0];})
      .property('value', function(d) { return d[1]; })
      .property('checked', function(d) { return fields[d[0]].selected.has(d[1]);})
      .on('change', function(d) {
        var set = fields[d[0]].selected;
        if (d3.select(this).property('checked')) set.add(d[1]);
        else set.delete(d[1]);
        var partial = fields[d[0]].values.length != set.size;
        d3.select('#'+d[0]+'-checkbox')
          .property('checked', set.size > 0)
          .property('indeterminate', partial);
        filter();
      });

    entry
      .append('text')
      .text(function(d) { return d[1]});


  }

  function collectValues(rows) {
    Object.keys(fields).forEach(function(field) {
      if (fields[field].type == 'category') {
        var set = new Set();
        rows.forEach(function(row) {
          set.add(row[field]);
        });
        var f = fields[field].init;
        fields[field].values = Array.from(set).sort(fields[field].sort);
        fields[field].selected = new Set(fields[field].values.filter(f));
      }
    });
  }

  function adjustColormap() {
    if (frozen) return;

    var min = 0;
    var max = Math.max(d3.max(mat.values, function (d) { return d.values[valueSelector]; }), 0.1);
    var mid = (min + max)/2; //swath.mid()*(max-min);
    cmap.value_range([min, mid, max]);
    swath.update(0.5);
    d3.select('#cmap_mid').text(format(mid));
    d3.select('#cmap_max').text(format(max));
  }

  function filter() {
    var keys = Object.keys(fields);
    var i, n = keys.length, key;
    active = data.filter(function(row) {
      for (i=0; i<n; i++) {
        key = keys[i];
        if (!fields[key].selected.has(row[key])) return false;
      }
      return true;
    });
    recompute();
  }

  function selectValue() {
    valueSelector = d3.select(this).property('value');
    recompute();
    if (!frozen)
      d3.select('#cmap_field').text(valueSelector);
  }

  function selectFunction() {
    functionSelector = d3.select(this).property('value');
    recompute();
  }

  function recompute() {
    d3.select('#selection-list').selectAll('li').remove();
    buildColsHeader(spec);
    mat = collect(spec,  aggregate(spec));
    adjustColormap();
    render(mat);
  }

  function aggregate(spec) {
    var nest = d3.nest();
    spec.rows.forEach(function(field) { nest.key(function(d) { return d[field.name];}).sortKeys(field.sort); } );
    spec.cols.forEach(function(field) { nest.key(function(d) { return d[field.name];}).sortKeys(field.sort); } );

    var f = functions[functionSelector];
    return nest.rollup(function(leaves) { return {
        leaves: leaves,
        min: f(leaves, function(d) { return d.min; }),
        avg: f(leaves, function(d) { return d.avg; }),
        max: f(leaves, function(d) { return d.max; }),
        //nonzero: d3.max(leaves, function(d) { return d.nonzero; }),
        nzavg: d3.sum(leaves, function(d) { return d.nzavg * d.nonzero; })/ d3.sum(leaves, function(d) { return d.nonzero; })
      }})
      .entries(active);
  }

  var header;
  var x0 = 0, y0 = 0;
  var dx = 2, dy = 2;
  var w = 15, h = 15;
  var fontSize = 15;
  var colHeight = 15;
  var lastRowWidth = 40;
  var lastColHeight = 40;
  var x, y;

  function buildColsHeader(spec) {
    var root, entry, value, field;

    // collect
    header = {field: spec.cols[0], label: "", values: new Map()};
    active.forEach(function(row) {
      root = header;
      for (var i= 0, n=spec.cols.length; i<n; i++) {
        field = spec.cols[i];
        value = row[field.name];
        entry = root.values.get(value);
        if (!entry) {
          entry =  i<n-1 && {field: spec.cols[i+1], label: value, values: new Map()} || {label: value, leaves:[]};
          root.values.set(value, entry);
        }
        if (i == n-1) entry.leaves.push(row);
        root = entry;
      }
    });

    // assign location and size
    visit(header, 0, 0);

    function visit(root, x, y) {
      root.x = x;
      root.y = y;
      if (root.values) {
        y += colHeight + dy;
        var keys = Array.from(root.values.keys()).sort(root.field.sort);
        keys.forEach(function (key) {
          x = visit(root.values.get(key), x, y)+dx;
        });
      } else {
        x += w+dx;
      }
      x -= dx;
      if (!root.values) root.y += lastColHeight;
      root.w = root.values ? x - root.x : lastColHeight;
      root.h = h;
      root.last = !root.values;
      return x;
    }
  }

  function collect(spec, nodes) {
    x = 0;
    y = 0;
    var mat = {header: {rows:[], cols:[]}, values:[]};
    var max_value = 0;
    var path = [];

    visit(spec.rows.length, spec.cols.length, nodes, header);
    return mat;

    function visit(nrows, ncols, nodes, header) {
      var i, n, node, nr = spec.rows.length, nc = spec.cols.length;
      if (nrows > 0) {
        for (i=0, n=nodes.length; i<n; i++) {
          node = nodes[i];
          node.label = node.key;
          node.x = x;
          node.y = y;
          x += +dx + (nrows == 1 ? lastRowWidth+5 : fontSize);
          node.last = nrows == 1;
          path.push(node.key);
          node.path = path.concat();
          visit(nrows-1, ncols, node.values, header);
          path.pop();
          if (nrows == 1) {
            y += h;
            node.w = lastRowWidth ;
            node.h = y - node.y - dy+1;
          } else {
            node.h = fontSize;
            node.w = y - node.y - dy;
          }
          x = node.x;
          y += dy;
          mat.header.rows.push(node);
        }
      }
      else {
        for (i=0, n=nodes.length; i<n; i++) {
          node = nodes[i];
          var pos = header.values.get(node.key);
          path.push(node.key);
          if (ncols == 1) {
            node.x = pos.x;
            node.y = y;
            node.w = w;
            node.h = h;
            x += w;
            node.path = path.concat();
            mat.values.push(node);
          } else {
            visit(nrows, ncols-1, node.values, pos);
          }
          x += dx;
          path.pop();
        }
      }
    }
  }

  function flatten(node) {
    var list = [];
    visit(node);
    list.shift();
    return list;

    function visit(node) {
      if (node) {
        list.push(node);
        if (node.values)
          node.values.forEach(function (node) { visit(node); });
      }
    }
  }

  function render(mat) {
    var rowsWidth = spec.rows.length*(w+dx)+lastRowWidth-w+5;
    var rowsHeight = y;
    var colsHeight = (spec.cols.length+1)*(colHeight+dy)+lastColHeight-colHeight;
    var colsWidth = header.x+header.w+dx;

    var cw = Math.min(15+colsWidth, (width-rowsWidth));
    var rh = Math.min(15+rowsHeight, (height-colsHeight));

    d3.select('#matrix')
      .style('width', rowsWidth+cw+'px')
      .style('height', colsHeight+rh+'px');

    d3.select('#selection')
      .style('left', rowsWidth+cw+40+'px');

    d3.select('#selection-list')
      .style('max-height', height-165+'px');

    d3.select('#frame')
      .style('top', 100+colsHeight+'px')
      .style('left', 180+rowsWidth+'px')
      .style('width',  cw+'px')
      .style('height',rh+'px');

    d3.select('#columns')
      .style('left', rowsWidth+'px')
      //.style('width', width-rowsWidth+'px')
      .style('width', colsWidth+'px')
      .style('height', colsHeight+'px')
      .style('max-width', Math.min(cw-15, colsWidth)+'px');

    d3.select('#rows')
      .style('top', colsHeight+'px')
      .style('width', rowsWidth+'px')
      .style('height', rowsHeight+'px') //Math.min(rowsHeight, height-colsHeight)+'px')
      .style('max-height', Math.min(rh-15, rowsHeight)+'px');

    var cols =d3.select('#columns')
      .selectAll('.col')
      .data(flatten(header));

    cols.enter()
      .append('div')
      .attr('class', 'col');
      //.on('click', select);

    cols
      .style('left', function(d) { return d.x+"px";})
      .style('top', function(d) { return d.y+"px";})
      //.style('top', function(d) { return (d.y+ (d.last ? 0 : d.w)+"px");})
      .style('width', function(d) { return d.w+"px";})
      .style('height', function(d) { return d.h+"px";})
      .classed('rotate', function(d) { return d.last; })
      .style('overflow', 'hidden')
      .text(function(d) { return d.label;})
    ;

    cols.exit().remove();

    var list = [];
    for (var i= 0, n=spec.cols.length; i<n; i++) {
      list.push({x: header.x+header.w+dx+5, y: header.y+(i+1)*(colHeight+dy), w:40, h: fontSize, label: spec.cols[i].name });
    }

    var colText = d3.select('#colums').selectAll('.colText')
      .data(list);

    colText.enter()
      .append('div')
      .attr('class', 'colText');

    colText
      .style('left', function(d) { return d.x+"px";})
      .style('top', function(d) { return d.y+"px"; })
      .style('width', function(d) { return d.w+"px";})
      .style('height', function(d) { return d.h+"px";})
      .text(function(d) { return d.label; });

    colText.exit().remove();

    var rows = d3.select('#rows')
      .selectAll('.row')
      .data(mat.header.rows);

    rows.enter()
      .append('div')
      .attr('class', 'row')
      .on('mouseeover', report)
      .on('mouseout', mouseout)
      .on('click', select);

    rows
      .classed('selected', false)
      .classed('rotate', function(d) { return !d.last; })
      .style('left', function(d) { return d.x+"px";})
      .style('top', function(d) { return (d.y+ (d.last ? 0 : d.w)+"px");})
      .style('width', function(d) { return d.w+"px";})
      .style('height', function(d) { return d.h+"px";})
      .style('overflow', 'hidden')
      .text(function(d) { return d.label;})
    ;

    rows.exit().remove();

    var d3nodes = d3.select('#values')
      .style('width', colsWidth+'px')
      .style('height', rowsHeight+'px')
      .selectAll('.value')
      .data(mat.values);

    d3nodes.enter()
      .append('div')
      .attr('class', 'value')
      .on('click', select)
      .on('mouseover', report)
      .on('mouseout', mouseout);


    d3nodes
      .style('left', function(d) { return d.x+"px";})
      .style('top', function(d) { return d.y+"px";})
      .style('width', function(d) { return d.w+"px";})
      .style('height', function(d) { return d.h+"px";})
      .style('background-color', function(d) { return cmap(d.values[valueSelector]); })
      .classed('selected', false)
    ;

    d3nodes.exit().remove();
  }

  var mouseout_timer = null;

  function mouseout() {
    mouseout_timer = window.setTimeout(function() {
      report();
      mouseout_timer = null;
    }, 50);
  }
  var currentSims;
  // var format = d3.format('5.1f');

  function encode(name, value) {
    var text = name + ': '+format(value);
    return name == valueSelector ? '<b>'+text+'</b>' : text;
  }

  function report(node) {

    if (!node) {
      d3.select('#selection-minmax-values').text('');
      d3.select('#selection-avg-values').text('');
      d3.select('#selection-list').selectAll('li').remove();
      return;
    }

    if (mouseout_timer) window.clearTimeout(mouseout_timer);

    d3.select('#selection-minmax-values').html(
      encode('min', node.values.min) + ' ' +
      encode('max', node.values.max));
    d3.select('#selection-avg-values').html(
      encode('avg', node.values.avg) + ' ' +
      encode('nzavg', node.values.nzavg));

    var sims = new Set();
    visit(node);

    currentSims = {key: node.path.join(), sims: Array.from(sims).sort()};

    var li = d3.select('#selection-list').selectAll('li')
      .data(currentSims.sims);

    li.enter().append('li');
    li.text(function(d) { return d;});
    li.exit().remove();

    function visit(node) {
      if (Array.isArray(node.values)) {
        node.values.forEach(function(d) { visit(d); });
      } else  {
        node.values.leaves.forEach(function(row) { sims.add(row.config+','+row.dataset+','+row.sim); });
      }
    }
  }

  function select() {
    dispatch.selected(currentSims);
  }

  return {
    on : function(type, cb) {
      dispatch.on(type, cb);
      return this;
    },

    resize: function(size) {
      width = size[0];
      height = size[1];
      swath.size(parseInt(d3.select('#cmap').style('width')));

      render(mat);
      return this;
    }
  }
});
