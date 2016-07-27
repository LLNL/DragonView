/**
 * Created by yarden on 7/27/16.
 */




export default function () {

  let value = function(item) { return item.data};
  let key = function(link) { return link.key};
  let filter = null;
  let n_bins = 1;

  function group(data) {
    let bins = new Array(n_bins),
      i = -1,
      v, k, bin;

    while (++i < n_bins) { bins[i] = {n: 0, max: 0, total: 0, avg:0};}

    for (let item of data) {
      if (!filter || filter(item)) {
        v = value(item);
        bin = bins[key(item)];
        bin.n++;
        bin.total += v;
        if (v > bin.max) bin.max = v;
      }
    }

    for (let bin of bins) {
      if (bin.n > 0) bin.avg = bin.total/bin.n;
    }

    return bins;
  }

  group.value = function(f) {
    if (!arguments.length) return value;
    value = f;
    return group;
  };

  group.key = function(f) {
    if (!arguments.length) return key;
    key = f;
    return group;
  };

  group.bins = function(_) {
    if (!arguments.length) return n_bins;
    n_bins = _;
    return group;
  };

  group.filter = function(_) {
    if (!arguments.length) return filter;
    filter = _ ;
    return group;
  };

  return group;
}