/**
 * Created by yarden on 6/6/16.
 */

import lockr from 'lockr';

let local = {};

let storage = {
  get(key, v) {
    if (!local.hasOwnProperty(key)) this.def(key, v);
    return local[key];
  },

  set(key, v) {
    if (!local.has(key)) this.def(key,v);
    else this[key] = v;
  },

  def(key, v) {
    Object.defineProperty(this, key, {
      get: function () {
        return local[key];
      },

      set: function (_) {
        local[key] = _;
        lockr.set(key, _);
      }
    });
  }
};

export default storage;