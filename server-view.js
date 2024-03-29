
/*
TODO<<>>

-global view

-validation
-built in methods
-client js editor
-stress testing

-local storage for persistance
-stat clear button
-weapon selector should stop scroll default
-warning message for IE/old browsers
-better mobile support (partial support)?
-refactoring?
-optimization (specifically data usage)?

*/

require('./server-game.js')();
require('./encoder.js')();

var localPort=4200;
function requireHTTPS(req, res, next) {
	if(req.get('host')!="localhost:"+localPort){
		// The 'x-forwarded-proto' check is for Heroku
		if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
			return res.redirect('https://' + req.get('host') + req.url);
		}
	}
	next();
}

var express = require('express');  
var app = express();  
app.use(requireHTTPS);
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
const PORT = process.env.PORT || localPort;

app.use(express.static(__dirname + '/node_modules'));  
// app.get('/', function(req, res,next) {  
//     res.sendFile(__dirname + '/client/index.html');
// });

app.get('/download', function(req, res){
	const file = `${__dirname}/bot.zip`;
	res.download(file); // Set disposition and send it.
});

app.use(express.static('client'));

var cycleCount=0;
var lastTime=0;

createGame();
setInterval(()=>{
	cycleCount++;
	for(let i=0;i<3;i++){
		runGame();
	}
	sendStateUpdate();
	calcRunningSpeed();
	if(cycleCount%10==0){//update every second
		sendMetaUpdate();
	}
}, 100);

function calcRunningSpeed(){
	if(cycleCount%10==0&&cycleCount>10){
		let currTime=getRealTime();
		let timePassed=currTime-lastTime;
		if(lastTime!=0){
			//console.log("10 frames took " + timePassed + " ms");
		}
		lastTime=currTime;
	}
}

function getRealTime(){
	return Date.now();
}

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
//this updates the scoreboard and game map
function sendMetaUpdate(){
	let game=getGlobalGame();
	let metaObj=stateMetaBlob(game.getScoreboard(),game.getMinimap());
	io.emit('meta', metaObj);
}
function sendKillSignal(userId){
	io.to(userId).emit('killed');
}

io.on('connection', socket => {
	let userId = socket.id;
	console.log("connected");
	registerUser(userId,()=>{sendKillSignal(userId)});

	io.to(userId).emit('settings', getSettings());

	socket.join(userId);
	//io.to(userId).emit('id',userId);

	socket.on('spawn', (data) => {
		if(data!=null){
			if(spawnSafe(userId,data)){
				sendStateBaseline();
				sendMetaUpdate();
			}
		}
	});

	socket.on('suicide', () => {
		suicideUser(userId);
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

server.listen(PORT);

// const Server = require('socket.io');
// const io = new Server();

// console.log("started");

// io.on('connect', socket => {
// 	let counter = 0;
// 	setInterval(() => {
// 	  socket.emit('hello', ++counter);
// 	}, 1000);
// });


