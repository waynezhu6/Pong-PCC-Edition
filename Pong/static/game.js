var socket = io();

socket.emit('new player'); //inform server that a new player has joined

class Game
{
	constructor()
	{
		this.P0 = new Player(0);
		this.P1 = new Player(1);
		this.B0 = new Ball();

		this.players = [this.P0, this.P1]; //array of players
		this.balls = [this.B0]; //array of balls

		this.S0 = false; //is slot 0 taken
		this.S1 = false; //is slot 1 taken

		this.active = false; //game is currently in play or not
		this.playersID = [];

		this.full = false; //true when 2 unique players first join
		this.gameCode = ("" + Math.random()).substring(2, 7); //generating a practically unique 5 digit game code ****FLAGGED FOR DELETION

		this.canvas = document.getElementById('canvas');
		this.canvas.width = 800;
		this.canvas.height = 600;
		this.context = this.canvas.getContext('2d');
	}

	newRound() //function to initiate a new 'round' of gameplay i.e. ball resets to center position on screen
	{
		for (var i = 0; i < this.balls.length; i++)
		{
			this.balls[i].active = true;
		}
	}

	endRound() //function to end a 'round' of gameplay i.e. someone scores
	{
		for (var i = 0; i < this.balls.length; i++)
		{
			this.balls[i].globalX = 400;
			this.balls[i].globalY = 300;
			this.balls[i].active = false;
		}
	}

	update() //handles logical updating of game elements
	{

		//sending the signals to the server upon userinput   
		//updating the local player first
		if (this.players[playerID].localUp && this.players[playerID].localY > 60)
		{
			this.players[playerID].localY -= 10;
			lastTimestamp = Date.now();
			socket.emit('moveUp', lastTimestamp);
		}
		if (this.players[playerID].localDown && this.players[playerID].localY < 540)
		{
			this.players[playerID].localY += 10;
			lastTimestamp = Date.now();
			socket.emit('moveDown', lastTimestamp);
		}

		//then updating network players based on information recieved from server
		for (var i = 0; i < this.players.length; i++)
		{
			if (i != playerID)
			{
				if (this.players[i].lastY > this.players[i].localY)
				{
					this.players[i].localY += 15;
				}
				else if (this.players[i].lastY < this.players[i].localY)
				{
					this.players[i].localY -= 15;
				}
			}
		}

		//setting the positions of the balls
		for (var j = 0; j < this.balls.length; j++)
		{
			if (this.balls[j].active)
			{
				this.balls[j].globalX += this.balls[j].globalDX;
				this.balls[j].globalY += this.balls[j].globalDY;
			}
		}
	}

	draw()
	{
		this.context.clearRect(0, 0, 800, 600);

		//drawing the players
		for (var i = 0; i < this.players.length; i++)
		{
			if (i == playerID) //draw the user's local state to eliminate percieved latency
			{
				this.context.fillStyle = 'white';
				this.context.beginPath();
				this.context.rect(this.players[i].localX - this.players[i].width / 2, this.players[i].localY - this.players[i].height / 2, this.players[i].width, this.players[i].height);
				this.context.fill();
			} else //otherwise draw the best estimate of the positions of online players
			{
				this.context.fillStyle = 'white';
				this.context.beginPath();
				this.context.rect(this.players[i].localX - this.players[i].width / 2, this.players[i].localY - this.players[i].height / 2, this.players[i].width, this.players[i].height);
				this.context.fill();
			}
		}

		//drawing the balls
		for (var j = 0; j < this.balls.length; j++)
		{
			this.context.fillStyle = 'white';
			this.context.beginPath();
			this.context.arc(this.balls[j].globalX, this.balls[j].globalY, this.balls[j].radius, 0, Math.PI * 2);
			this.context.fill();
		}

		//drawing the scores
		this.context.font = "60px VT323";
		this.context.fillText(this.P0.score, 80, 70);
		this.context.fillText(this.P1.score, 690, 70);
	}
}

class Player
{

	constructor(id)
	{

		if (id == 0)
		{
			this.globalX = 50;
			this.localX = 50;
		} else if (id == 1)
		{
			this.globalX = 750;
			this.localX = 750;
		}

		this.globalY = 300;
		this.localY = 300;

		this.width = 12;
		this.height = 100;

		this.lastY = 300;
		this.score = 0;

	}
}

class Ball
{

	constructor()
	{

		this.localX = 400;
		this.localY = 300;
		this.localDX = 5;
		this.localDY = 5;

		this.globalX = 400;
		this.globalY = 300;
		this.globalDX = 8;
		this.globalDY = 0;

		this.radius = 10;
		this.active = false;

	}
}

/*########################################################################################################
 WEB SCRIPTS*/

var gameCode = null; //local copy of the recieved game code
socket.on('sendGameCode', function (code) //upon recieving the game code when creating a new game
{
	gameCode = code;
	document.getElementById('lblWaitingForPlayer').innerHTML = "Waiting for Player 2";
	document.getElementById('lblConnectionCode').innerHTML = "Connection Code: " + gameCode; //display code
});

socket.on('gameCodeFailed', function () //server reply when client provides an invalid game code
{
	document.getElementById('lblInvalidCode').style.display = "block";
});

socket.on('serverFull', function () //recieved when server is unable to accomodate additional clients
{
	document.getElementById('lblWaitingForPlayer').innerHTML = "Server Currently Full";
	document.getElementById('lblConnectionCode').innerHTML = "Try again later";
	clearInterval(timer);

});

socket.on('gameStarted', function () //server message sent when game is full and starting immediately
{
	var login = document.getElementById('loginDiv');
	login.style.visibility = 'hidden';
	document.getElementById('joinGameDiv').style.visibility = 'hidden';
	document.getElementById('newGameDiv').style.visibility = 'hidden';
	game.full = true;
	clearInterval(timer);
});

var timer;
function newGameClicked() //on clicking the new game button
{
	var login = document.getElementById('loginDiv');
	socket.emit('newGame');
	login.style.visibility = 'hidden';
	document.getElementById('newGameDiv').style.visibility = 'visible';
	currentScreen = 1;

	var element = document.getElementById('lblWaitingForPlayer');
	timer = setInterval(function ()
	{
		if (element.innerHTML == "Waiting for Player 2...")
		{
			element.innerHTML = "Waiting for Player 2";
		}
		else
		{
			element.innerHTML = element.innerHTML + ".";
		}
	}, 1500);
}

function joinGameClicked() //on clicking the join game button
{
	var login = document.getElementById('loginDiv');
	login.style.visibility = 'hidden';
	document.getElementById('joinGameDiv').style.visibility = 'visible';
	currentScreen = 2;
}

function btnBackClick() //upon clicking the back button
{
	var login = document.getElementById('loginDiv');
	login.style.visibility = 'visible';
	document.getElementById('joinGameDiv').style.visibility = 'hidden';
	document.getElementById('newGameDiv').style.visibility = 'hidden';
	document.getElementById('lblInvalidCode').style.display = 'none';
	document.getElementById('inputConnectionCode').value = "";
}

function btnEnterClick() //upon clicking the enter button
{
	var gameCode = document.getElementById('inputConnectionCode').value;
	socket.emit('joinGame', gameCode);
}

function btnCancelClick() //upon clicking the cancel button
{
	var login = document.getElementById('loginDiv');
	login.style.visibility = 'visible';
	document.getElementById('joinGameDiv').style.visibility = 'hidden';
	document.getElementById('newGameDiv').style.visibility = 'hidden';
	socket.emit('cancelNewGame');
	clearInterval(timer);
}

function gameOverClicked() //upon clicking the game over popup
{
	var login = document.getElementById('loginDiv');
	login.style.visibility = 'visible';
	document.getElementById('gameOverDiv').style.display = "none";
	var context = document.getElementById('canvas').getContext('2d');
	context.clearRect(0, 0, 800, 600);
}

function allowNumbersOnly(e) //filtering out non-numeric input for game codes
{
	var code = (e.which) ? e.which : e.keyCode;
	if (code > 31 && (code < 48 || code > 57))
	{
		e.preventDefault();
	}
	document.getElementById('lblInvalidCode').style.display = 'none';
}

/*########################################################################################################
GAME LOGIC*/

var game = new Game(); //local instance of the game the client is in
var playerID; //numeric identifier signifying which player the client controls in a game
var lastTimestamp = Date.now(); //timestamp of the last valid game state refresh

setInterval(function () //having the local instance of the game update its game logic and refresh the screen
{
	if (game.full) 
	{
        game.update();
		game.draw();
    }
}, 1000 / 60);

socket.on('assignPlayerID', function (id) //players are assigned an ID from the server upon joining the game
{ 
    playerID = id;
});

socket.on('newRound', function () //starting a new round of gameplay
{
	for (var i = 0; i < game.balls.length; i++) //set every ball in motion
	{
		game.balls[i].active = true;
	}
});

socket.on('validatedMoveUp', function (data) //server-acknowledged up input
{ 
	if (data.ts >= lastTimestamp)  //only use server update information if considered up to date
	{
		game.players[playerID].localY = data.y;
		game.players[playerID].globalY = data.y;
    }
});

socket.on('validatedMoveDown', function (data) //server-acknowledged down input
{
	if (data.ts >= lastTimestamp) //only use server update information if considered up to date
	{
		game.players[playerID].localY = data.y;
		game.players[playerID].globalY = data.y;
    }
});

socket.on('ballCollision', function (data) //server informs client that the ball has made a collision
{
	var id = data.id;
	game.balls[id].globalDX = data.dX; //sync ball's rate of change
	game.balls[id].globalDY = data.dY;
	game.balls[id].globalX = data.x; //sync ball's position on screen
	game.balls[id].globalY = data.y;
});

socket.on('scoreChange', function (id) //sent by server when score changes
{
	game.players[id].score += 1; //update local game's scores

	for (var i = 0; i < game.balls.length; i++) //for every ball in play
	{
		game.balls[i].globalX = 400; //reset ball's position to center of screen
		game.balls[i].globalY = 300;

		if (id == 0) // if left player scored
		{
			game.balls[i].globalDX = 8; //have the ball move straight towards the right player on the next round
			game.balls[i].globalDY = 0;
		}
		else if (id == 1) //else if right player scored
		{
			game.balls[i].globalDX = -8; //have the ball move straight towards the left player on the next round
			game.balls[i].globalDY = 0;
		}

		game.balls[i].active = false; //stop the balls from moving
    }
});

socket.on('gameOver', function (id) //sent by server when the game ends
{
	var element;
	game.endRound();
	if (id == 0) //if player 0 wins
	{
		element = document.getElementById('gameOverDiv');
		element.innerHTML = "Left Player Wins!"
		element.style.visibility = 'visible';
	}
	else if (id == 1) //if player 1 wins
	{
		element = document.getElementById('gameOverDiv');
		element.innerHTML = "Right Player Wins!"
		element.style.visibility = 'visible';
	}
	else if (id == -1) //if game ended prematurely due to disconnection
	{
		element = document.getElementById('gameOverDiv');
		element.innerHTML = "Player Disconnected";
		element.style.visibility = 'visible';
	}
	game.endRound(); //ends the current round
	game.full = false;

});

socket.on('worldUpdate', function (data) //server sends clients a snapshot of the game world periodically to keep clients in sync
{

	game.players[0].lastY = game.players[0].globalY; //sync y position of left player
	game.players[0].globalY = data.P0y;

	game.players[1].lastY = game.players[1].globalY; //sync y position of right player
	game.players[1].globalY = data.P1y;

	game.balls[0].globalX = data.B0x; //sync ball position
	game.balls[0].globalY = data.B0y;

});

var lastEvent; //voiding input if the last key event is the same as the current

document.addEventListener('keydown', function (e) //upon a key being hit
{
    if (lastEvent && event.keyCode == lastEvent.keyCode) //ensuring that keydown only registers
    {
        return;
	}

	if (e.keyCode == 87 || e.keyCode == 38) //W or arrow up
	{
		game.players[playerID].localUp = true;
	}
	else if (e.keyCode == 83 || e.keyCode == 40) //S or arrow down
	{
		game.players[playerID].localDown = true;
	}

    lastEvent = event;

});

document.addEventListener('keyup', function (e) //upon a key being released
{
	if (e.keyCode == 87 || e.keyCode == 38) //W or arrow up
	{
		game.players[playerID].localUp = false;
	}
	else if (e.keyCode == 83 || e.keyCode == 40) //S or arrow down
	{
		game.players[playerID].localDown = false;
	}

	lastEvent = null;

});

document.addEventListener('touchstart', function (e) //upon the document is touched
{
	if (game.full) //only register if game is in play
	{
		var rect = e.target.getBoundingClientRect();
		var x = e.touches[0].clientX - rect.left;

		if (x < window.outerWidth / 2) //touch is on left half of the screen
		{
			game.players[playerID].localUp = true;
		}
		else //touch is on right half of the screen
		{
			game.players[playerID].localDown = true;
		}
	}

});

document.addEventListener('touchend', function () //upon the document is released
{
	if (game.full) //only register if game is in play
	{
		game.players[playerID].localUp = false;
		game.players[playerID].localDown = false;
	}
    
});

var startTime;

function Ping() //checking time between request and response 
{
    startTime = Date.now(); //time when function is called
    socket.emit('sent'); //send a ping request and await server response
}

socket.on('recieved', function () //upon recieving a response from the server
{
    var latency = Date.now() - startTime; //change in time between request and response
    console.log(latency); //record in console
});
