define([
  'underscore',
  'backbone',
  'models/player',
  'models/board'
], function(_, Backbone, Player, Board) {
  var Game = Backbone.Model.extend({
	  defaults: {
	  		player1: new Player(),
	  		player2: new Player(),
		    board: new Board()
		  },
		  
	  gameStatuses: {
	    	SETUP: 0,
	    	IN_PROGRESS: 1,
	    	OVER: 2
	   },
      
      initialize: function () {
    	  this.initPieces();
    	  this.set("gameStatus", this.gameStatuses.SETUP);
    	  this.set("turn", this.get("player1"));
      },
      
      initPieces: function () {
      	var board = this.get("board");
      	var player1 = this.get("player1"), player2 = this.get("player2");
      	
      	//Place pieces around the outside
      	var count = 0;
      	for (var i = 0; i < board.getNumCols(0); i++) {
      		if (board.addNewPiece((count % 2 === 0) ? player1 : player2, 0, i)) {      			
      			count++;
      		}
      	}
      	for (var i = 1; i < board.getNumRows(); i++) {
      		if (board.addNewPiece((count % 2 === 0) ? player1 : player2, i, board.getNumCols(i)-1)) {
	      		count++;
      		}
      	}
      	for (var i = board.getNumCols(board.getNumRows()-2); i >= 0; i--) {
      		if (board.addNewPiece((count % 2 === 0) ? player1 : player2, board.getNumRows()-1, i)) {      			
      			count++;
      		}
      	}
      	for (var i = board.getNumRows()-2; i >= 0; i--) {
      		if (board.addNewPiece((count % 2 === 0) ? player1 : player2, i, 0)) {
	      		count++;
      		}
      	}
      	
      	//Place the two interior pieces
      	var numMiddleRow = Math.floor(board.getNumRows() / 2);
      	var tempOwner = board.getPieceAt(numMiddleRow, 0).get("owner");
      	board.addNewPiece((tempOwner === player1) ? player1 : player2, numMiddleRow, 2);
      	board.addNewPiece((tempOwner === player1) ? player2 : player1, numMiddleRow, board.getNumCols(numMiddleRow) - 3);
      	
      },
      
      /**
       * Checks if a move is valid
	   * @param {Piece} piece1 the first piece being moved
	   * @param {Piece} piece2 the second piece being moved
	   * @param {Object} dest1 an object containing the row and col of the destination of piece1
	   * @param {Object} dest2 an object containing the row and col of the destination of piece2
       */
      isValidMove: function (piece1, piece2, dest1, dest2) {
      	//game must not already be over, the pieces must be adjacent, 
      	// dest1 adj to piece1, dest2 adj to piece2,
      	// the defstinations must be adj, and both dests must be valid spots
      	// if the dest is occupied, it must be by the other piece (for a switch)
      	var board = this.get("board");
      	var piece1Coords = {
      		row: piece1.get("row"),
      		col: piece1.get("col")
      	};
      	var piece2Coords = {
      		row: piece2.get("row"),
      		col: piece2.get("col")
      	};
      	return board.isAdjacent(piece1Coords, piece2Coords) && 
          		board.isAdjacent(dest1, dest2) && 
          		board.isAdjacent(piece1Coords, dest1) && 
          		board.isAdjacent(piece2Coords, dest2) &&
          		board.isOnBoard(dest1.row, dest1.col) &&
          		board.isOnBoard(dest2.row, dest2.col) &&
          		(
          		  board.getPieceAt(dest1.row, dest1.col) === undefined || 
          		  board.getPieceAt(dest1.row, dest1.col) === piece2
          		) &&
          		(
          		  board.getPieceAt(dest2.row, dest2.col) === undefined || 
          		  board.getPieceAt(dest2.row, dest2.col) === piece1
          		);
      },
      
      /**
       * Attempts to make a move and changes the turn if it is successful.
       * Also checks if the game is over.
  	   * @param {Piece} piece1 the first piece being moved
  	   * @param {Piece} piece2 the second piece being moved
  	   * @param {Object} dest1 an object containing the row and col of the destination of piece1
  	   * @param {Object} dest2 an object containing the row and col of the destination of piece2
  	   * 
  	   * @return {boolean} true if the move was successful, false otherwise
       */
      makeMove: function (piece1, piece2, dest1, dest2) {
        console.log("making move");
        var board = this.get("board");
        if (this.get("gameStatus") === this.gameStatuses.IN_PROGRESS && 
            this.isValidMove(piece1, piece2, dest1, dest2)) {
          if (piece1.get("row") === dest2.row && piece1.get("col") === dest2.col &&
              piece2.get("row") === dest1.row && piece2.get("col") === dest1.col) {
            //This is a swap
            this.trigger("change");
            board.swapPieces(piece1, piece2);
          } else {
            this.trigger("change");
            board.movePiece(piece1, dest1)
                  .movePiece(piece2, dest2);
          }
          
          //Change turn
          this.set("turn", this.get("turn") === this.player1 ? this.player2 : this.player1 );
          console.log("is game over?", this.isGameOver());
          if (this.isGameOver()) {
            alert("Game over");
            this.set("gameStatus", this.gameStatuses.OVER);
          } 
          return true;
        }
      	return false;
      },
      
      /**
       * @return the {Player} who has won, or false if the game is not over
       */
      isGameOver: function () {
      	var board = this.get("board"),
      		allPieces = board.getAllPieces(),
      		currPiece = allPieces[0],
      		seen = [],
      		chainLength = 0,
      		chainDir;
      		// javascript:debugger;      	
      	var search = function (currPiece, chainLength, chainDir) {
      		seen.push(currPiece);	
      		
          var adjPieces = board.getAdjacentPieces(currPiece);
          for (var i in adjPieces) {
            var adjPiece = adjPieces[i];
    				if (seen.indexOf(adjPiece.piece) === -1 && 
    				    currPiece.get("owner") === adjPiece.piece.get("owner")) {
    					if (!chainDir) {
    						return search(adjPiece.piece, 2, adjPiece.direction);
    					} else if (adjPiece.direction === chainDir) {
    						  // javascript:debugger;
    						if (++chainLength === 4) {
    							return true;
    						}						
    						return search(adjPiece.piece, chainLength, chainDir);
    					}
    				}
            
          }			
      	};
      	
      	for (var i in allPieces) {
      		if (seen.indexOf(allPieces[i]) === -1 && search(allPieces[i], 0)) return true;
      	}
      	return false;
      },
      
      startGame: function () {
        console.log("starting game");
        this.set("currPlayer", this.get("player1"));
        this.set("gameStatus", this.gameStatuses.IN_PROGRESS);
        this.trigger("gameStart");
      }

  });
  return Game;
});
