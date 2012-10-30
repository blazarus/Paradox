define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var Player = Backbone.Model.extend({
	  defaults: {
		    name: "",
		    email: ""
		  },

      initialize: function () {
      }
  });
  return Player;
});
