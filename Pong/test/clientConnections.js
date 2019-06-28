const expect = require("chai").expect;
const GameManager = require("../classes/GameManager");

const io = require('socket.io-client');

var socketURL = "http://99.245.93.208:5000";
var options = {
	transports: ['websocket'],
	'force new connection': true
};

describe("New Game", function () //Testing server responses upon recieving new game request from client
{
	it("1 client Connected and recieved game code", function (done) //a client requests new game to empty server
	{
		var recievedGameCode = false;
		var client = io.connect(socketURL, options);
		client.emit('newGame'); //client makes new game request

		client.on('sendGameCode', function () //upon recieving game code
		{
			recievedGameCode = true;
			expect(recievedGameCode).to.equal(true);
		});
		client.disconnect();
		done();
	});

	it("5 clients connected and recieved game code", function (done) //5 clients request new games to empty server
	{
		var recievedGameCode = [];
		var clients = [];

		for (var i = 0; i < 5; i++) //creates 5 clients
		{
			recievedGameCode[i] = false;
			clients[i] = io.connect(socketURL, options);
			clients[i].emit('newGame'); //each client makes a new game request

			clients[i].on('sendGameCode', function () //each clients is expected to get a game code
			{
				recievedGameCode[i] = true;
				expect(recievedGameCode).to.equal(true);
			});
			clients[i].disconnect();			
		}			
		done();
	});

	it("6 clients connected and server full", function (done) //6 clients request a new game. Only the first 5 should recieve one before server becomes full
	{
		var recievedGameCode = [];
		var clients = [];

		for (var i = 0; i < 5; i++) //first 5  clients
		{
			recievedGameCode[i] = false;
			clients[i] = io.connect(socketURL, options);
			clients[i].emit('newGame');

			clients[i].on('sendGameCode', function () //first 5 are expected to recieve a game code
			{
				recievedGameCode[i] = true;
				expect(recievedGameCode).to.equal(true);
			});
			clients[i].disconnect();
		}

		var client = io.connect(socketURL, options); //the 6th client
		client.emit('newGame');

		client.on('serverFull', function () //6th client is expected to recieve a server full message
		{
			recievedGameCode[5] = false;
			expect(recievedGameCode).to.equal(false);
		});
		client.disconnect();

		done();
	});

});

describe("Join Game", function () //Testing server responses upon recieving join game requests from client
{
	it("1 client submits valid game code", function (done)
	{

		var GM = new GameManager();
		var gameCode = GM.games[0].gameCode; 

		var validGameCode = false;
		var client = io.connect(socketURL, options);
		client.emit('joinGame', gameCode); //client makes new game request

		client.on('gameStarted', function () //upon recieving game code
		{
			validGameCode = true;
			expect(validGameCode).to.equal(true);
		});
		client.disconnect();
		done();
	});

	it("1 client submits invalid game code", function (done)
	{
		var gameCode = "00000";

		var validGameCode;
		var client = io.connect(socketURL, options);
		client.emit('joinGame', gameCode); //client makes new game request

		client.on('gameCodeFailed', function () //upon recieving game code
		{
			validGameCode = false;
			expect(validGameCode).to.equal(false);
		});
		client.disconnect();
		done();
	});

})