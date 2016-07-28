/**
 * Created by yarden on 7/27/16.
 */

import template from './overview.html!text';
import * as d3 from 'd3';

import Groups from '../components/groups';

export default function () {

  let groups = Groups();

  function panel(selection) {
    selection
      .html(template)
      .select('svg').call(groups);

    return this;
  }

  return panel;
}