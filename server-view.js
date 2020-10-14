
/*
TODO<<>>
-testing for bad user inputs
	-Make sure usernames can't have "," or "|"

-optimize server/client communications to use less data

-local view/editor
	-60fps smoothing
	-server lag/ping tracking ?
-global view
-documentation
-human player/control

*/


require('./server-game.js')();
require('./encoder.js')();

var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));  
// app.get('/', function(req, res,next) {  
//     res.sendFile(__dirname + '/client/index.html');
// });

app.use(express.static('client'))

createGame();
setInterval(()=>{
	runGame();
	sendStateUpdate();
}, 50);

var dirtyBaseline=false;
function sendStateBaseline(){
	dirtyBaseline=true;
}
function sendStateUpdate(){
	let baseline="";
	if(dirtyBaseline){
		baseline=stateBaselineBlob(getGlobalState()).toString();
		dirtyBaseline=false;
	}
	for(let i=0;i<users.length;i++){
		if(users[i].state!=null&&users[i].player!=null){
			// let buffer=Buffer.from(stateUpdateBlob(users[i].state));
			// let arrBuff=Uint8Array.from(buffer).buffer;
			//console.log(arrBuff.byteLength);
			let stateStr=stateUpdateBlob(users[i].state).toString();
			io.to(users[i].id).emit('state', users[i].player.uid+"|"+baseline+"|"+stateStr);
		}
	}
}

io.on('connection', socket => {
	let userId = socket.id;
	console.log("connected");
	registerUser(userId);

	io.to(userId).emit('settings', getSettings());

	socket.join(userId);
	//io.to(userId).emit('id',userId);

	socket.on('spawn', (data) => {
		if(data!=null){
			if(spawnSafe(userId,data)){
				sendStateBaseline();
			}
		}
	});

	socket.on('control', (data) => {
		if(data!=null){
			controlSafe(userId,data);
		}
	});

	socket.on('disconnecting', () => {
		console.log("disconnected");
		disconnectUser(userId);
	});
});

server.listen(4200);


// const Server = require('socket.io');
// const io = new Server();

// console.log("started");

// io.on('connect', socket => {
// 	let counter = 0;
// 	setInterval(() => {
// 	  socket.emit('hello', ++counter);
// 	}, 1000);
// });

