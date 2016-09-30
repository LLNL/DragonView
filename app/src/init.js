/**
 * Created by yarden on 12/15/14.
 */
require.config({

  baseUrl: 'src',
  //urlArgs: "v=" +  (new Date()).getTime(),

  paths: {
    text: '../lib/requirejs-text/text',
    jquery: '../lib/jquery/dist/jquery.min',
    jqueryui: '../lib/jquery-ui/jquery-ui.min',
    underscore: '../lib/lodash/lodash.min',
    //underscore: '../lib/underscore/underscore',
    backbone: '../lib/backbone/backbone',
    radio: '../lib/backbone.radio/build/backbone.radio',
    d3: '../lib/d3/d3',
    d3_queue: '../lib/queue-async/queue',
    resize: '../lib-code/jquery-element-onresize'
  }
});

// bootstrap the application
require(['app'], function() {});