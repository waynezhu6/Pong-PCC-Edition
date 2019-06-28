// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 4000');
});

const GameManager = require("./classes/GameManager");

var GM = new GameManager(io);
var currentClients = 0;  //lets me know how many clients are connected right now

setInterval(function () //call an update to game state 60 times a second
{
	GM.update();
}, 1000 / 60);

setInterval(function () //call a broadcast of game state to clients 15 times a second
{
	GM.tick();
}, 1000 / 15);

io.on('connection', function (socket) 
{
	currentClients += 1;
	var date = getDate();
	console.log('Connected: ' + date + ' | ' + currentClients);
	
	socket.on('newGame', function () //when player selects new game on splash screen
	{
		GM.newGame(socket);
	});

	socket.on('cancelNewGame', function () //when player cancels a new game on the splash screen
	{
		GM.cancelNewGame(socket);
	});

	socket.on('joinGame', function (code) //when player requests to join a preexisting game on the splash screen
	{
		GM.joinGame(socket, code);
	});
    
	socket.on('disconnect', function () //upon a client disconnecting
	{
		GM.disconnected(socket);
		currentClients -= 1;
		var date = getDate();
		console.log('Disconnected: ' + date + ' | ' + currentClients);
    }); 
    
	socket.on('moveUp', function (timestamp) //upon recieving a request to move paddle up
	{
		GM.moveUp(socket, timestamp);
        
    });
    
	socket.on('moveDown', function (timestamp) //upon recieving a request to move paddle down
	{
		GM.moveDown(socket, timestamp);

	});

	socket.on('sent', function () //ping test
	{
		socket.emit('recieved');
	});

	socket.on('sendSocketID', function ()
	{
		GM.removePlayer(socket.id);
	});
});

function getDate()
{
	var m = new Date();
	var dateString =
		m.getUTCFullYear() + "/" +
		("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" +
		("0" + m.getUTCDate()).slice(-2) + " " +
		("0" + m.getUTCHours()).slice(-2) + ":" +
		("0" + m.getUTCMinutes()).slice(-2) + ":" +
		("0" + m.getUTCSeconds()).slice(-2);

	return dateString;
}
