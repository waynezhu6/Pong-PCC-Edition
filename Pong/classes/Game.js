const Player = require('./Player');
const Ball = require('./Ball');

class Game
{
	constructor(id, io)
	{
		this.io = io; //reference to socket
		this.gameID = id.toString(); //unique identifier of game representing index in the GameManager's games array
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
		this.gameCode = ("" + Math.random()).substring(2, 7); //create a reasonably unique 5 digit code
	}

	newRound() //have the balls start moving
	{
		for (var i = 0; i < this.balls.length; i++)
		{
			this.balls[i].active = true;
		}
	}

	endRound() //stops balls from moving and resets them
	{
		for (var i = 0; i < this.balls.length; i++)
		{
			this.balls[i].globalX = 400;
			this.balls[i].globalY = 300;
			this.balls[i].active = false;
		}
	}

	update() //calling an update to game logic
	{
		for (var j = 0; j < this.balls.length; j++) //looping through all balls in the game
		{
			if (this.balls[j].active) //provided that the ball in question is in motion
			{
				this.balls[j].globalX += this.balls[j].globalDX; //move the ball by it's designated rate of change
				this.balls[j].globalY += this.balls[j].globalDY;

				if (this.balls[j].globalY < 10 || this.balls[j].globalY > 590) //if ball hits one of the walls
				{
					this.balls[j].globalDY = -this.balls[j].globalDY; //reverse y-direction of ball
					let object = { id: j, x: this.balls[j].globalX, y: this.balls[j].globalY, dX: this.balls[j].globalDX, dY: this.balls[j].globalDY };
					this.io.to(this.gameID).emit('ballCollision', object); //broadcast ball object to clients

					this.balls[j].globalX += 2 * this.balls[j].globalDX; //push the ball out of position slightly to prevent recollision in case ball is stuck 'inside' wall
					this.balls[j].globalY += 2 * this.balls[j].globalDY;
				}
				if (this.balls[j].globalX - 10 < this.players[0].globalX + 10 && this.balls[j].globalX - 10 > this.players[0].globalX - 10) //checking collision x-range of player on the left
				{
					if (this.balls[j].globalY < this.players[0].globalY + 65 && this.balls[j].globalY > this.players[0].globalY - 65) //checking collision y-range of player on the left
					{

						let colDistance = this.balls[j].globalY - this.players[0].globalY; //distance from point of contact to paddle's center
						let colAngle = colDistance; //angle in degrees, maximum 50 degrees

						this.balls[j].globalDX = this.balls[j].speed * Math.cos(colAngle * Math.PI / 180); //change rate of change appropriate to angle while maintaining ball speed
						this.balls[j].globalDY = this.balls[j].speed * Math.sin(colAngle * Math.PI / 180);

						this.balls[j].speed += 0.3; //speed the ball up slightly

						this.balls[j].globalX += this.balls[j].globalDX; //displace the ball slightly to prevent repeat collisions
						this.balls[j].globalY += this.balls[j].globalDY;

						let object = { id: j, x: this.balls[j].globalX, y: this.balls[j].globalY, dX: this.balls[j].globalDX, dY: this.balls[j].globalDY };
						this.io.to(this.gameID).emit('ballCollision', object); //update clients about new ball state
					}
				}
				else if (this.balls[j].globalX + 10 < this.players[1].globalX + 10 && this.balls[j].globalX + 10 > this.players[1].globalX - 10)//checking collision x-range of player on the right
				{
					if (this.balls[j].globalY < this.players[1].globalY + 65 && this.balls[j].globalY > this.players[1].globalY - 65) //checking collision y-range of player on the right
					{
						let colDistance = this.balls[j].globalY - this.players[1].globalY; //distance from point of contact to paddle's center
						let colAngle = colDistance; //angle in degrees, maximum 50 degrees

						this.balls[j].globalDX = this.balls[j].speed * Math.cos(colAngle * Math.PI / 180); //change rate of change appropriate to angle while maintaining ball speed
						this.balls[j].globalDY = this.balls[j].speed * Math.sin(colAngle * Math.PI / 180);

						this.balls[j].speed += 0.3; //speed the ball up slightly

						this.balls[j].globalDX = -this.balls[j].globalDX; //make the ball move left after colliding with right paddle

						this.balls[j].globalX += this.balls[j].globalDX; //displace the ball slightly to prevent repeat collisions
						this.balls[j].globalY += this.balls[j].globalDY;

						let object = { id: j, x: this.balls[j].globalX, y: this.balls[j].globalY, dX: this.balls[j].globalDX, dY: this.balls[j].globalDY };
						this.io.to(this.gameID).emit('ballCollision', object); //update clients about new ball state
						
					}
				}

				if (this.balls[j].globalX < 0) //if the ball is off the left side of the screen
				{
					this.players[1].score += 1; //add score to right player
					this.balls[j].globalX = 400; //reset the ball
					this.balls[j].globalY = 300;
					this.balls[j].globalDX = -8;
					this.balls[j].globalDY = 0;
					this.balls[j].speed = 8;
					this.balls[j].active = false;

					this.io.to(this.gameID).emit('scoreChange', 1); //update clients about score

					if (this.players[1].score == 11) //if right player reaches the threshold of victory
					{
						this.io.to(this.gameID).emit('gameOver', 1);
						this.endRound();
					}
					else //otherwise start a new round after sa 1s delay
					{
						let _this = this;
						setTimeout(function ()
						{
							_this.io.to(_this.gameID).emit('newRound');
							_this.newRound();
						}, 1000);
					}
				}
				else if (this.balls[j].globalX > 800) //if the ball is off the right side of the screen
				{
					this.players[0].score += 1; //add score to left player
					this.balls[j].globalX = 400; //reset the ball
					this.balls[j].globalY = 300;
					this.balls[j].globalDX = 8;
					this.balls[j].globalDY = 0;
					this.balls[j].speed = 8;
					this.balls[j].active = false;

					this.io.to(this.gameID).emit('scoreChange', 0); //update clients about score

					if (this.players[0].score == 11) //if left player reaches the threshold of victory
					{
						console.log('gameOver');
						this.io.to(this.gameID).emit('gameOver', 0);
						this.endRound();
					}
					else //otherwise start a new round after a 1s delay
					{
						let _this = this;
						setTimeout(function ()
						{
							_this.io.to(_this.gameID).emit('newRound');
							_this.newRound();
						}, 1000);
					}
				}
			}
		}
	}

	tick() //call to broadcast snapshot of gamestate to all connected clients
	{
		var object = { P0y: this.players[0].globalY, P1y: this.players[1].globalY, B0x: this.B0.globalX, B0y: this.B0.globalY};
		this.io.to(this.gameID).emit('worldUpdate', object);
	}
}

module.exports = Game;