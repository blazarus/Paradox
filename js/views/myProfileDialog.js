define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/myProfileDialog.html',
  'models/board',
  'models/player',
  'models/game'
], function($, _, Backbone, MyProfDialogTemplate, Board, Player, Game){
  var MyProfileDialogView = Backbone.View.extend({
    el: '#myprofile-dialog',
    render: function () {
      this.$el.html(_.template(MyProfDialogTemplate, {  }));
      this.$el.dialog();
      
      return this;
    },
    events: {
      "click #myprofile-link": "open",
      "submit form": "open"
    },
    
    open: function (e) {
      console.log("got a click event");
      return false;
    }
    
  });
  return MyProfileDialogView;
});
