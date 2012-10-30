define([
  'jquery',
  'underscore',
  'backbone',
  'vm',
  'text!templates/board/board.html',
  'models/board',
  'models/player',
  'models/game'
], function($, _, Backbone, Vm, boardTemplate, Board, Player, Game){
    var GameboardPage = Backbone.View.extend({
      el: '#gameboard',
      
      sideLength: 170,
      centerX: 175,
      centerY: 175,
      player1Color: "AAFF00",
      player2Color: "00BBCC",
      emptySpaceColor: "FFFFFF",
      selected: {},
      
      events: {
  	    "mousemove"                : "render",
  	    "click"                    : "handleClick"
    	},
      
      /**
       * Get dimensions of hexagon based on side length
       */
      getLongDiagLength: function () {
  		// 2 * radius = vertex to vertex diagonal = 2 * side length
      	return this.sideLength * 2;
      },
      getShortDiagLength: function () {
      	return this.sideLength * Math.sqrt(3);
      },
      
      initialize: function () {
        var that = this;
        this.model.startGame();
        this.model.on("change", function (e) {
          that.render(e);
        });
  						
      },
      
      getGameboard: function () {
  		if (this.el.getContext) {
  		    return this.el.getContext("2d");
  		}
  	},
      
  	render: function (e) {
  		var ctx = this.getGameboard();
  		
  		ctx.clearRect(0, 0, this.$el.width(), this.$el.height());
  		
  		this.drawPolygon(this.centerX, this.centerY, this.sideLength, 6, ctx);
  		
  		this.drawCircles(e, ctx);
  
  		return this;
  	},
  	
  	drawCircles: function (e, ctx) {
  		var board = this.model.get("board"); //The Board model within the Game
  		var spacingX = this.getLongDiagLength() / 7, 
  			spacingY = this.getShortDiagLength() / 7;
  		var offsetX = 9, 
  			offsetY = 29;
  		var mousePos;
  		if (e) {
  			mousePos = this.getSpotFromMousePos(e);
  		}
  		
  		for (var row = 0; row < board.getNumRows(); row++) {
  			for (var col = 0; col < board.getNumCols(row); col++) {
  				var piece = board.getPieceAt(row, col);
  				var radius = 20;
  				x = offsetX + col*spacingX + radius + 25*Math.abs((row - Math.floor(board.getNumRows() / 2)));
  				y = offsetY + row*spacingY + radius;
  				
  				ctx.lineWidth = 1;
  				ctx.strokeStyle = "black";
  				ctx.fillStyle = piece? 
  					(piece.get("owner") === this.model.get("player1")? 
  						this.player1Color : this.player2Color) : 
  					this.emptySpaceColor;
  				ctx.beginPath();
  				ctx.arc(x,y,radius,0,Math.PI*2,false);
  				ctx.stroke();
  				ctx.fill();
  				
  				if (mousePos && mousePos.row === row && mousePos.col === col) {
  					//Highlight the space where the user's mouse is'
  					ctx.fillStyle = "rgba(0,0,0,.5)";
  					ctx.beginPath();
  					ctx.arc(x,y,radius,0,Math.PI*2,false);
  					ctx.fill();
  				}
  				
  				if ((this.selected.firstPiece && row === this.selected.firstPiece.get("row") && col === this.selected.firstPiece.get("col")) ||
              (this.selected.secondPiece && row === this.selected.secondPiece.get("row") && col === this.selected.secondPiece.get("col"))) {
  				  //Outline the currently selected piece
  				  ctx.lineWidth = 5;
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.arc(x,y,radius,0,Math.PI*2,false);
            ctx.stroke();
  				}
  			}
  		}
  		
  	},
  	
  	/**
  	 * Draws a regular polygon on the canvas
  	 * @param {Object} x the x coord of the center of the polygon
  	 * @param {Object} y the y coord of the center
  	 * @param {Object} radius the radius of the enclosing circle
  	 * @param {Object} numSides number of sides in the polygon
  	 * @param {Object} context the context for the canvas
  	 */
  	drawPolygon: function (x, y, radius, numSides, context) {
  		var deg2rad = function (ang) {
  	    	return ang * (Math.PI/180.0);
  		};
  		
  		var angChange = deg2rad(360.0/numSides);
  		var prevX, prevY, firstX, firstY, x1, y1;
  		context.lineWidth = 1;
  		for(var i=0;i<numSides;i++) { 
  			angle=i*angChange;
  			prevX=x1;
  			prevY=y1;
  			x1=x+Math.cos(angle) * radius;
  			y1=y+Math.sin(angle) * radius;
  			if(i> 0) {
          context.moveTo(prevX,prevY);
  	      context.lineTo(x1,y1);
        }
  	    else {
          firstX = x1;
          firstY = y1;
  	    }
  	    if (i == numSides-1) {	        	
    	     context.lineTo(firstX,firstY);
        }
  	            
  	    context.stroke();
      } //End for loop
  	},
	
  	getSpotFromMousePos: function (e) {
  		//relative to canvas
  		var x = e.pageX - this.$el.offset().left;
  		var y = e.pageY - this.$el.offset().top;
  		
  		var top = this.centerY - this.getShortDiagLength()/2;
  		var yOffset = y - top;
  		var rowStep = this.getShortDiagLength() / 7;
  		var row = Math.floor(yOffset / rowStep);
  		
  		if (row >= 0 && row < this.model.get("board").getNumRows()) {
  			yOffset = this.getShortDiagLength() / 2 - Math.abs(y - this.centerY)
  			var width = yOffset / (this.getShortDiagLength()/2) * this.sideLength + this.sideLength;
  			
  			var numCols = this.model.get("board").getNumCols(row);
  			var left = this.centerX - width/2;
  			var xOffset = x - left;
  			var colStep = width / numCols;
  			var col = Math.floor(xOffset / colStep);
  			
  			if (col >= 0 && col < this.model.get("board").getNumCols(row)) {
  				// console.log("mouse pos:", row, col, "width:", width, "xOffset:", xOffset);
  				
  				return {
  					row: row,
  					col: col
  				};
  			}
  		}
  		return false;
  	},
  	
  	handleClick: function (e) {
  	  var board = this.model.get("board");
  	  var mousePos = this.getSpotFromMousePos(e);  	  
	    var targetPiece = board.getPieceAt(mousePos.row, mousePos.col);
	    
  	  if (!this.selected.firstPiece && !this.selected.secondPiece && targetPiece) {
  	    this.selected.firstPiece = targetPiece;
  	  } else if (this.selected.firstPiece && !this.selected.secondPiece && targetPiece) {
  	    if (targetPiece.get("owner") !== this.selected.firstPiece.get("owner") && 
  	       board.isAdjacent(mousePos, { row: this.selected.firstPiece.get("row"), col: this.selected.firstPiece.get("col")})) {
  	      this.selected.secondPiece = targetPiece;
  	    }
  	  } else if (this.selected.firstPiece && this.selected.secondPiece && !this.selected.firstDest) {
  	    this.selected.firstDest = mousePos;
  	  } else if (this.selected.firstPiece && this.selected.secondPiece && this.selected.firstDest) {
  	    //Actually make move, if valid
  	    console.log("Attempting to make move");
  	    var success = this.model.makeMove(this.selected.firstPiece, this.selected.secondPiece, this.selected.firstDest, mousePos);
  	    //Clear selection
	      this.selected = {};
    	  console.log("Move was successful:", success);
  	  } else {
  	    //ERROR!
  	  }
      this.render();
  	  console.log("Selected pieces:", this.selected);
  	},
  	
  	handleChange: function (e) {
  	  alert("got a change event!")
  	}
  });
  return GameboardPage;
});
