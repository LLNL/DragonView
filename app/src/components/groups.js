/**
 * Created by yarden on 7/27/16.
 */

import group from '../stat/group';


export default function() {
  let value = item => item.value;
  let bins = 1;

  function groups(data) {
    let collect = group().bins(bins).value(value).key(d => d.link.sg);

    return [
      {id: 'g',     data: collect.filter(d => d.link.type == 'g')(data)},
      {id: 'k',     data: collect.filter(d => d.link.type == 'k')(data)},
      {id: 'b_out', data: collect.filter(d => d.link.type == 'b')(data)},
      {id: 'b_in',  data: collect.key(d => d.link.dg)(data)}
    ];
  }

  groups.value = function(_) {
    if (!arguments.length) return value;
    value = _;
    return this;
  };

  groups.bins = function(_) {
    if (!arguments.length) return bins;
    bins = _;
    return this;
  };

  return groups;
}