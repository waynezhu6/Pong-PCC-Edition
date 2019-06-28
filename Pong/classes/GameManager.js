const Game = require('./Game');

class GameManager
{
	constructor(io)
	{
		this.io = io; //reference to socket
		this.games = []; //array of active games

		for (var i = 0; i < 5; i++) //populate games array by instantiating 5 empty games
		{
			this.games[i] = new Game(i, this.io);
		}

		this.players = []; //this.players[socket.id] = index of game in this.games[]
	}

	newGame(socket) //upon recieving a new game request
	{
		for (var i = 0; i < 5; i++) //for each of the 5 games
		{
			if (!this.games[i].S0 && !this.games[i].S1) //if game is completely empty
			{
				this.games[i].S0 = true; //sets player 0 slot to full
				this.games[i].playersID[socket.id] = 0; //associates player socket.id to player 0 identity

				socket.join(i.toString()); //subscribes client to game 'room'
				socket.emit('sendGameCode', this.games[i].gameCode); //sends gamecode to client
				socket.emit('assignPlayerID', 0); //assign player's ID to 0

				this.players[socket.id] = i;
				return;
			}
		}
		socket.emit('serverFull'); //informs client that connection failed because server is full
	}

	cancelNewGame(socket) //upon recieving a cancel new game request
	{
		var gameID = this.players[socket.id];

		if (gameID != null) //checking if player is actually in active players list
		{
			this.games[gameID] = new Game(gameID, this.io); //resets the game
			delete this.players[socket.id];
		}
		//this.debug();
	}

	joinGame(socket, code) //upon recieving a join game request
	{
		for (var i = 0; i < 5; i++) //for each of the 5 games
		{
			if (this.games[i].gameCode == code && !this.games[i].full) //if code is valid and game isn't already full
			{
				this.games[i].S1 = true; //sets player 1 slot of game to full
				this.games[i].playersID[socket.id] = 1; //associates client's socket.id with player 1 in game
				this.games[i].full = true; //sets gamestate to full to start the game
				this.players[socket.id] = i; //associates player's socket.id to game i

				socket.join(i.toString());
				socket.emit('assignPlayerID', 1); //assigns player's ID to 1
				this.io.to(i.toString()).emit('gameStarted'); //send message to all clients subscribed to game's local room

				var _this = this;
				setTimeout(function () //initiates a new round after a 3 second delay
				{
					_this.io.to(i.toString()).emit('newRound');
					_this.games[i].newRound();
				}, 3000);
				return;
			}
		}

		socket.emit('gameCodeFailed'); //otherwise inform client if code does not match with any game
	}

	disconnected(socket)
	{
		var gameID = this.players[socket.id];
		if (gameID != null) //if disconnected player was active in a game
		{
			var game = this.games[gameID];

			if (game.playersID[socket.id] == 0) //set game player 0 slot to empty if playerID is 0
			{
				game.S0 = false;
			}
			else if (game.playersID[socket.id] == 1) //set game player 1 slot to empty if playerID is 1
			{
				game.S1 = false;
			}

			if (game.full && (!game.S0 || !game.S1)) //if game was previously full but not currently full
			{
				this.io.to(gameID.toString()).emit('gameOver', -1);
				game.endRound();
			}

			this.games[gameID] = new Game(gameID, this.io) //resets game
			delete this.players[socket.id]; //removes player from active players array
			console.log('Disconnected: ' + socket.id);

		}

	}

	moveUp(socket, timestamp)
	{
		var gameID = this.players[socket.id];
		if (gameID != null)
		{
			var game = this.games[gameID];

			if (game.full) //only execute if game is currently full and in play
			{
				var id = game.playersID[socket.id];

				if (game.players[id].globalY > 70) //if player is not moving off the top of the screen
				{
					game.players[id].globalY -= 15; //raises paddle y position
					var data = { y: game.players[id].globalY, ts: timestamp };
					socket.emit('validatedMoveUp', data); //send back an event validating the move along with a timestamp
				}
			}
		}

	}

	moveDown(socket, timestamp)
	{
		var gameID = this.players[socket.id];
		if (gameID != null)
		{
			var game = this.games[gameID];

			if (game.full) //only execute if game is currently full and in play
			{
				var id = game.playersID[socket.id];

				if (game.players[id].globalY < 530) //if player is not moving off the bottom of the screen
				{
					game.players[id].globalY += 15; //lowers paddle y position
					var data = { y: game.players[id].globalY, ts: timestamp };
					socket.emit('validatedMoveDown', data);
				}
			}
		}
	}

	update() //called to update game state
	{
		for (var i = 0; i < this.games.length; i++)
		{
			if (this.games[i].full)
			{
				this.games[i].update();
			}
		}
	}

	tick() //called to send snapshot of gamestate to all relevant clients
	{
		for (var i = 0; i < this.games.length; i++)
		{
			if (this.games[i].full)
			{
				this.games[i].tick();
			}
		}
	}

}

module.exports = GameManager;
