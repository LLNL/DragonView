/**
 * Created by yarden on 12/15/14.
 */
require.config({

  baseUrl: 'src',
  //urlArgs: "v=" +  (new Date()).getTime(),

  paths: {
    tpl: '../template',
    text: '../lib/requirejs-text/text',
    jquery: '../lib/jquery/dist/jquery.min',
    ui: '../lib/jquery-ui/ui',
    underscore: '../lib/lodash/lodash.min',
    //underscore: '../lib/underscore/underscore',
    backbone: '../lib/backbone/backbone',
    radio: '../lib/backbone.radio/build/backbone.radio',
    d3: '../lib/d3/d3',
    d3_queue: '../lib/queue-async/queue.min',
    resize: '../lib-code/jquery-element-onresize'
  }
});


// bootstrap the application
require(['app'], function(app) {
  app().start();
});