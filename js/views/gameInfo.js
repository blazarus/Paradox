define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/gameInfoTemplate.html',
  'models/board',
  'models/player',
  'models/game'
], function($, _, Backbone, GameInfoTemplate, Board, Player, Game){
  var GameInfoView = Backbone.View.extend({
    el: '#game-info',
    render: function () {
      var currPlayerName = this.model.get("currPlayer").get("name");
      this.$el.html(_.template(GameInfoTemplate, { currPlayerName: currPlayerName }));
      
      
    },
    events: {
      
    },
    
  });
  return GameInfoView;
});
