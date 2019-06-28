class Player
{

	constructor(id)
	{

		if (id == 0) //if left player
		{
			this.globalX = 50; //server-verified x of center of paddle
		}
		else if (id == 1) //else if right player
		{
			this.globalX = 750;
		}

		this.globalY = 300; //server-verified y of center of paddle

		this.width = 12; //width of paddle
		this.height = 100; //height of paddle

		this.score = 0; //player's current score
	}
}

module.exports = Player;