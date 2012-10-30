define([
  'underscore',
  'backbone',
  'models/player'
], function(_, Backbone, Player) {
  var Piece = Backbone.Model.extend({
	  defaults: {
		    row: 0,
		    col: 0,
		    owner: new Player()
		  }
  });
  return Piece;
});
