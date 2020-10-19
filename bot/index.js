
require('./bot.js')();

var express = require('express');  
var app = express();
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var ioClient = require('socket.io-client');
const PORT = 5000;

app.use(express.static(__dirname + '/node_modules'));  
app.use(express.static('client'));


//--------------------------------------------------------------
const socket = ioClient.connect("http://localhost:4200");

var state=null;
var stateBaseline=null;
var settings=null;

var bot=new Bot();

setInterval(()=>{
	let tarPlayer=getPlayerByUid(state.playerUid);
	let req=bot.control(tarPlayer,state,settings);
	let reqStr=req.getString();
	byteEstimateUp+=byteCount(reqStr);
	socket.emit("control",reqStr);
}, 1000/10);

function getPlayerByUid(uid){
	for(let i=0;i<stateBaseline.playersList.length;i++){
		if(stateBaseline.playersList[i].uid==uid){
			return stateBaseline.playersList[i];
		}
	}
	return null;
}

function spawnIn(){
	let toSpawn=bot.spawn();
    socket.emit("spawn",toSpawn);
}

socket.on('settings', (data) => {
	settings=data;
	spawnIn();
});
socket.on('killed', (data) => {
	spawnIn();
});
socket.on('state', (data) => {
	//console.log(byteCount(JSON.stringify(data)));
	//console.log(data,byteCount(data));
	stateString=data;
	byteEstimateDown+=byteCount(stateString);
	let strArr=data.split("|");
	if(strArr[1].length>0){
		parseStateBaseline(strArr[1]);
	}
	parseStateUpdate(strArr[2]);
	state.playerUid=+strArr[0];
    //state=data;
});

var stateString="";//for debugging
var byteEstimateDown=0;//for debugging
var byteEstimateUp=0;

function parseStateBaseline(str){
	if(stateBaseline==null){
		stateBaseline={};
	}
	let arrRaw=str.split(",");
	let index=0;
	let ps=[];
	while(index<arrRaw.length){
		let target={};
		target.uid=+arrRaw[index];
		index++;
		target.username=arrRaw[index];
		index++;
		target.healthMax=+arrRaw[index];
		index++;
		target.colorDark=arrRaw[index];
		index++;
		target.colorLight=arrRaw[index];
		index++;
        target.size=+arrRaw[index];
		index++;
        target.sight=+arrRaw[index];
		index++;
		target.weapon={};
        target.weapon.name=arrRaw[index];
		index++;
		ps.push(target);
	}
	stateBaseline.playersList=ps;
}
function parseStateUpdate(str){
	state={};
	let arrRaw=str.split(",");
	if(arrRaw.length<3){
		return null;
	}
	let bCount=+arrRaw[0];
	let pCount=+arrRaw[1];
	let wCount=+arrRaw[2];
	let bs=[];
	let ps=[];
	let index=3;
	for(let i=0;i<bCount;i++){
		let target={};
		target.uid=+arrRaw[index];
		index++;
        target.shooterUid=+arrRaw[index];
        let shooter=getPlayerByUid(target.shooterUid);
        target.colorDark=shooter.colorDark;
        target.colorLight=shooter.colorLight;
		index++;
        target.name=arrRaw[index];
		index++;
		target.pos=new Vector();
        target.pos.x=+arrRaw[index];
		index++;
		target.pos.y=+arrRaw[index];
		index++;
		target.velo=new Vector();
        target.velo.x=+arrRaw[index];
		index++;
		target.velo.y=+arrRaw[index];
		index++;
        target.ang=+arrRaw[index];
		index++;
        target.size=+arrRaw[index];
		index++;
		bs.push(target);
	}
	for(let i=0;i<pCount;i++){
		let uid=+arrRaw[index];
		let player=getPlayerByUid(uid);
		let target=player;
		index++;
		target.pos=new Vector();
        target.pos.x=+arrRaw[index];
		index++;
		target.pos.y=+arrRaw[index];
		index++;
		target.velo=new Vector();
        target.velo.x=+arrRaw[index];
		index++;
		target.velo.y=+arrRaw[index];
		index++;
        target.rot=+arrRaw[index];
		index++;
        target.health=+arrRaw[index];
		index++;
        target.transparent=(arrRaw[index]==1);
		index++;
		ps.push(target);
	}
	for(let i=0;i<wCount;i++){
		let ownerUid=+arrRaw[index];
		let player=getPlayerByUid(ownerUid);
		let target=player.weapon;
		let name=target.name;
		index++;
		if(name=="unarmed"){
			target.timeUp=+arrRaw[index];
			index++;
			target.time=+arrRaw[index];
			index++;
			target.surrenderSize=+arrRaw[index];
			index++;
		}else if(name=="wall"||name=="claw"){
			target.rot=+arrRaw[index];
			index++;
		}else if(name=="spinner"){
			target.rot1=+arrRaw[index];
			index++;
			target.rot2=+arrRaw[index];
			index++;
		}else if(name=="charger"||name=="stealth"){
			target.stored=+arrRaw[index];
			index++;
		}
	}
	state.bulletsList=bs;
	state.playersList=ps;
}

function byteCount(s) {
	var enc = new TextEncoder(); // always utf-8
	let UintArr=enc.encode(s); // uint8 array
	return UintArr.byteLength;

    //return encodeURI(s).split(/%..|./).length - 1;
}