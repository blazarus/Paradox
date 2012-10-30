// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  paths: {
    // Major libraries
    jquery: 'libs/jquery/jquery-min',
    jqueryui: 'libs/jquery/jquery-ui',
    underscore: 'libs/underscore/underscore-min', // https://github.com/amdjs
    backbone: 'libs/backbone/backbone-min', // https://github.com/amdjs
    sinon: 'libs/sinon/sinon.js',

    // Require.js plugins
    text: 'libs/require/text',
    order: 'libs/require/order',

    // Just a short cut so we can put our html outside the js dir
    // When you have HTML/CSS designers this aids in keeping them out of the js directory
    templates: '../templates'
  },
	urlArgs: "bust=" +  (new Date()).getTime()

});

// Let's kick off the application

require([
  'views/app',
  'router',
  'vm',
  'jquery',
  'jqueryui'
], function(AppView, Router, Vm){
  //Set up socket.io
  socket = io.connect("http://localhost");
  console.log("socket", socket);
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });


  var appView = Vm.create({}, 'AppView', AppView);
  Router.initialize({appView: appView});
  appView.render(); // render() calls Backbone.history when its ready to start
});
