class Ball
{

	constructor()
	{

		this.globalX = 400; //x of center position of ball
		this.globalY = 300; //y of center position of ball
		this.globalDX = 8; //change in x per update cycle
		this.globalDY = 0; //change in y per update cycle

		this.radius = 10; //radius of the ball
		this.active = false; //whether or not the ball is in motion
		this.speed = 8; //speed of the ball
	}
}

module.exports = Ball;