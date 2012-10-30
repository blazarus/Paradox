define([
  'jquery',
  'underscore',
  'backbone',
  'vm',
  'text!templates/friendsListTemplate.html',
  'models/board',
  'models/player',
  'models/game'
], function($, _, Backbone, Vm, FriendsListTemplate, Board, Player, Game){
  var FriendsListView = Backbone.View.extend({
    el: '#friends-list',
    render: function () {
      var friends = ["Brett", "Zach"];
      this.$el.html(_.template(FriendsListTemplate, { friendsList: friends }));
      console.log("got here. Rendered the stupid friends list jeez");
    }
  });
  return FriendsListView;
});
