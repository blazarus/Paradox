define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var Coord = Backbone.Model.extend({
	  defaults: {
		    xPos: 0,
		    yPos: 0,
		    occupied: false
		  },
		  
	  url: 'http://localhost:8080/game'
//    url: 'http://backbonetutorials.nodejitsu.com/game',
      
      initialize: function () {
    	  console.log("Coord initialized", arguments);
    	  
      }
  });
  return Coord;
});
