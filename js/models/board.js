define([
  'underscore',
  'backbone',
  'models/piece'
], function(_, Backbone, Piece) {
  var Board = Backbone.Model.extend({
	  defaults: {
		    sideLength: 4
	  },
	  
	  directions: {
	    	TOP_LEFT: 1,
	    	TOP_RIGHT: 2,
	    	LEFT: 3,
	    	RIGHT: 4,
	    	BOTTOM_LEFT: 5,
	    	BOTTOM_RIGHT: 6
	   },
  
	  board: [],
		  
	  url: 'http://localhost:8080/board',
      
      initialize: function () {
    	  var board = [];
    	  board.numRows = this.get("sideLength") * 2 - 1;
    	  
    	  for (var i = 0; i < board.numRows; i++) {
    		  board[i] = []; //the row
    		  if (i < this.get("sideLength")) {
    			  board[i].numCols = this.get("sideLength") + i;
    		  } else {
    			  board[i].numCols = this.get("sideLength") * 2 - (i - this.get("sideLength") + 2);
    		  }
    		  for (var j = 0; j < board[i].numCols; j++) {
    			  board[i][j] = undefined;
    		  }
    	  }
    	  this.set("board", board);
      },
      
      addNewPiece: function (player, row, col) {
      	if (this.isOpenSpot(row, col)) {
      		this.get("board")[row][col] = new Piece({
      			row: row,
      			col: col,
      			owner: player
      		});
      		return true;
      	} else {
      		return false;
      	}
      },
      
      getNumRows: function () {
      	return this.get("board").numRows;
      },
      
      getNumCols: function (row) {
      	if (row !== undefined && row >= 0 && row < this.getNumRows()) {
      		return this.get("board")[row].numCols;
      	} else {
      		throw "" + row + " is not a valid row";
      	}
      },
      
      isOpenSpot: function (row, col) {
      	return this.isOnBoard(row, col) && !this.isSpotOccupied(row, col);
      },
      
      isSpotOccupied: function (row, col) {
      	return this.get("board")[row][col] !== undefined;
      },
      
      getPieceAt: function (row, col) {
      	if (this.isOnBoard(row, col)) {
      		return this.get("board")[row][col];
      	} else return undefined;
      },
      
      /**
       * @param coord1, coord2, the two coordinates to check. Should be objects with row and col fields.
       */
      isAdjacent: function (coord1, coord2) {
    	  if (coord1.row === coord2.row && Math.abs(coord2.col - coord1.col) === 1) {
    		  //same row
    		  return true;
    	  } else if (Math.abs(coord1.row - coord2.row) === 1) {
    		//one row apart
    		  if (coord1.col === coord2.col) return true;
    		  
    		  var below, above;
    		  if (coord1.row > coord2.row) below = coord1, above = coord2;
    		  else below = coord2, above = coord1;
    		  
    		  if (below.row <= Math.floor(this.getNumRows() / 2)) {
    			  //on the top half of the board
    			  if (below.col === above.col + 1) return true;
    			  else return false;
    		  } else {
    			  //bottom half of the board
    			  if (below.col === above.col - 1) return true;
    			  else return false;
    		  }
    	  }
    	  return false;
      },
      
      /**
       * @param {Piece} piece the piece to get any pieces adjacent to it
       * @return {[Piece]} a list of Pieces adjacent to the parameter
       */
      getAdjacentPieces: function (piece) {
      	var row = piece.get("row"),
      		col = piece.get("col"),
      		adj = [],
      		other = {},
      		dirs = this.directions,
      		midRow = Math.floor(this.getNumRows() / 2);
      		
      	if ((other = this.getPieceAt(row, col-1))) adj.push({
	      		piece: other,
	      		direction: dirs.LEFT
      		});
      	if ((other = this.getPieceAt(row, col+1))) adj.push({
	      		piece: other,
	      		direction: dirs.RIGHT
      		});
      		
      	if (row <= midRow) {
        	if ((other = this.getPieceAt(row-1, col-1))) adj.push({
  	      		piece: other,
  	      		direction: dirs.TOP_LEFT
        		});
        	if ((other = this.getPieceAt(row-1, col))) adj.push({
  	      		piece: other,
  	      		direction: dirs.TOP_RIGHT
        		});
      	  
      	} else {
        	if ((other = this.getPieceAt(row-1, col))) adj.push({
              piece: other,
              direction: dirs.TOP_LEFT
            });
          if ((other = this.getPieceAt(row-1, col+1))) adj.push({
              piece: other,
              direction: dirs.TOP_RIGHT
            });
      	  
      	}

        if (row < midRow) {
          if ((other = this.getPieceAt(row+1, col))) adj.push({
            piece: other,
            direction: dirs.BOTTOM_LEFT
          });
          if ((other = this.getPieceAt(row+1, col+1))) adj.push({
              piece: other,
              direction: dirs.BOTTOM_RIGHT
            });
        } else {
          if ((other = this.getPieceAt(row+1, col-1))) adj.push({
            piece: other,
            direction: dirs.BOTTOM_LEFT
          });
          if ((other = this.getPieceAt(row+1, col))) adj.push({
              piece: other,
              direction: dirs.BOTTOM_RIGHT
            });
        }
      	
      	return adj;
      },
      
      getAllPieces: function () {
      	var allPieces = [];
      	
      	for (var row = 0; row < this.getNumRows(); row++) {
      		for (var col = 0; col < this.getNumCols(row); col++) {
      			var piece = this.getPieceAt(row, col);
      			if (piece) {
      				allPieces.push(piece);
      			}
      		}
      	}
      	
      	return allPieces;
      },
      
      isEdge: function (row, col) {
    	  var board = this.get("board");
    	  if (row === 0 || col === 0 || row === board.length - 1) {
    		  return true;
    	  } else {
    		  for (var x in board) {
    			  if (row === x && col === board[x].length - 1) return true;
    		  }
    		  return false;
    	  }
      },
      
      isOnBoard: function (row, col) {
    	  var board = this.get("board");
    	  if (row >= 0 && row < board.numRows && col >= 0 && col < board[row].numCols) return true;
    	  return false;
      },
      
      /**
       * Moves a piece to a new location. 
       * Note that checking whether it is ok to move to this 
       * location should be handled in game logic.
  	   * @param {Piece} piece the piece to move
  	   * @param {Object} dest an object containing the row and col of the destination of piece
       */
      movePiece: function (piece, dest) {
    		this.get("board")[piece.get("row")][piece.get("col")] = undefined;
    		this.get("board")[dest.row][dest.col] = piece;
    		//Update coordinates in the piece
    		piece.set({
    		  row: dest.row,
    		  col: dest.col
    		});
    		return this;
      },
      
      /**
       * Swaps two pieces on the board and updates the coordinates in 
       * each Piece model
       * @param {Piece} piece1
       * @param {Piece} piece2
       */
      swapPieces: function (piece1, piece2) {
        if (!piece1 || !piece2) return false;
        
        this.get("board")[piece1.get("row")][piece1.get("col")] = piece2;
        this.get("board")[piece2.get("row")][piece2.get("col")] = piece1;
        //Update coordinates within the pieces
        var oldPiece1coords = {
          row: piece1.get("row"),
          col: piece1.get("col")
        };
        piece1.set({
          row: piece2.get("row"),
          col: piece2.get("col")
        });
        piece2.set(oldPiece1coords);
        return true;
      },
      
      toString: function () {
    	  var str = "";
    	  var board = this.get("board");
    	  var currY = 0;
    	  
    	  for (var i in board) {
    		  
    		  for (var x = 0; x < Math.abs(i - Math.floor(board.length / 2)); x++) {
    			  str += "   ";
    		  }
    		  for (var j = 0; j < board[i].numCols; j++) {
    			  // str += "(" + i + "," + j + ") ";
    			  str += (board[i][j] !== undefined) ? board[i][j].get("owner").get("name") + "  " : "XX   "; 
    		  }
    		  str += "\n\n";
    	  }
    	  
    	  return str;
      }
  });
  return Board;
});
