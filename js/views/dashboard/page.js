define([
  'jquery',
  'underscore',
  'backbone',
  'vm',
  'text!templates/guestbook/template.html',
  'views/guestbook/form',
  'views/guestbook/list',
  'views/gameboard/gameboard',
  'views/gameInfo',
  'views/friendsList',
  'views/myProfileDialog',
  'models/board',
  'models/player',
  'models/game'
], function($, _, Backbone, Vm, guestbookTemplate, GuestbookFormView, GuestbookListView, GameboardView, GameInfoView, FriendsListView, MyProfileDialogView, Board, Player, Game){
  var DashboardPage = Backbone.View.extend({
  	el: '.page',
  	render: function () {
  		$(this.el).html(guestbookTemplate);
  		
  		var profDialog = Vm.create(this, 'MyProfileDialogView', MyProfileDialogView, {});
  		//if no name is set, open the myprofile dialog to set up player info
  		if (!this.myprofile) {
        profDialog.render();
  		}
                  
  		var p1 = new Player({
  			name: "Hans"
  		});
  		var p2 = new Player({
  			name: "Franz" 
  		});
  		var board = new Board({
  			sideLength: 4
  		});
  		var game = new Game({
  			player1: p1,
  			player2: p2,
  			board: board
  		});
  
  		// Create new Backbone views using the view manager (does some extra goodies);
  		var boardView = Vm.create(this, 'GameboardView', GameboardView, {
  			model: game
  		});
  		boardView.render();
        
  		var gameInfoView = Vm.create(this, 'GameInfoView', GameInfoView, {
  		  model: game
  		});
  		gameInfoView.render();
  		
  		var friendsListView = Vm.create(this, 'FriendsListView', FriendsListView, {});
  		friendsListView.render();
        
      return this;
    } //End render()
    
  });
  return DashboardPage;
});
