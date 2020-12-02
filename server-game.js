require('./util.js')();
require('./weapons.js')();
require('./simulator.js')();

var users=[];
var gameRunner=null;
function createGame(){
	gameRunner=new Game();
	gameRunner.setup();
	gameRunner.run();
}
function runGame(){
	runQueue();
	gameRunner.run();
	clearDead();
	gameRunner.prepView();
	for(let i=0;i<users.length;i++){
		if(users[i].player!=null){
			users[i].state=gameRunner.getViewState(users[i].player);
		}else{
			users[i].state=null;
		}
	}
}
function getSettings(){
	return gameRunner.settings;
}

class User{
	constructor(id,killFunc){
		this.killFunc=killFunc;
		this.id=id;
		this.player=null;
		this.queue=null;
		this.state=null;
	}
	setPlayer(toSet){
		this.player=toSet;
	}
}

function registerUser(id,killFunc){
	users.push(new User(id,killFunc));
}
function disconnectUser(id){
	let user=getUser(id);
	if(user!=null&&user.player!=null){
		user.player.kill();
	}
	for(let i=0;i<users.length;i++){
		if(users[i].id==id){
			users.splice(i,1);
			break;
		}
	}
}
function suicideUser(id){
	let user=getUser(id);
	if(user!=null&&user.player!=null){
		user.player.kill();
	}
}
function clearDead(){
	for(let i=users.length-1;i>=0;i--){
		if(users[i].player!=null&&users[i].player.isDead()){
			users[i].player=null;
			if(users[i].killFunc!=null){
				users[i].killFunc();
			}
		}
	}
}
function spawnSafe(id,data){
	let toSpawn=validateSpawn(data);
	return spawnPlayer(id,toSpawn.username,toSpawn.color,toSpawn.stats)
}
function spawnPlayer(id,username,color,stats){
	let user=getUser(id);
	if(user!=null&&user.player==null){
		let spawnPos=new Vector((Math.random()*2-1)*gameRunner.settings.size.x,(Math.random()*2-1)*gameRunner.settings.size.y);
		let toSpawn=new Player(username,color,stats,spawnPos,gameRunner.settings);
		gameRunner.spawn(toSpawn);
		user.player=toSpawn;
		return true;
	}
	return false;
}
function validateSpawn(data){
	let usernameLength=20;
	let toSpawn={};
	if(typeof data.username=="string"){
		data.username=data.username.replace(/,/g,"");
		data.username=data.username.replace(/\|/g,"");
	}
	toSpawn.username=(typeof data.username=="string" && data.username.length>0)?data.username.substring(0, usernameLength):"unknown";
	toSpawn.color=isHex(data.color)?data.color:"#0087E8";
	toSpawn.stats=data.stats?parseStats(data.stats):new Stats();
	return toSpawn;
}
function parseStats(stats){
	let validStats=new Stats();

	validStats.health=typeof stats.health=='number'&&!isNaN(stats.health)?Math.min(Math.max(stats.health,0),100):0;
	validStats.regen=typeof stats.regen=='number'&&!isNaN(stats.regen)?Math.min(Math.max(stats.regen,0),100):0;
	validStats.speed=typeof stats.speed=='number'&&!isNaN(stats.speed)?Math.min(Math.max(stats.speed,0),100):0;
	validStats.size=typeof stats.size=='number'&&!isNaN(stats.size)?Math.min(Math.max(stats.size,0),100):0;
	validStats.sight=typeof stats.sight=='number'&&!isNaN(stats.sight)?Math.min(Math.max(stats.sight,0),100):0;

	validStats.meleeDamage=typeof stats.meleeDamage=='number'&&!isNaN(stats.meleeDamage)?Math.min(Math.max(stats.meleeDamage,0),100):0;

	validStats.reload=typeof stats.reload=='number'&&!isNaN(stats.reload)?Math.min(Math.max(stats.reload,0),100):0;
	validStats.damage=typeof stats.damage=='number'&&!isNaN(stats.damage)?Math.min(Math.max(stats.damage,0),100):0;
	//validStats.range=typeof stats.range=='number'?Math.min(Math.max(stats.range,0),100):0;
	validStats.bulletSpeed=typeof stats.bulletSpeed=='number'&&!isNaN(stats.bulletSpeed)?Math.min(Math.max(stats.bulletSpeed,0),100):0;
	validStats.bulletSize=typeof stats.bulletSize=='number'&&!isNaN(stats.bulletSize)?Math.min(Math.max(stats.bulletSize,0),100):0;
	validStats.knockback=typeof stats.knockback=='number'&&!isNaN(stats.knockback)?Math.min(Math.max(stats.knockback,0),100):0;
	validStats.kickback=typeof stats.kickback=='number'&&!isNaN(stats.kickback)?Math.min(Math.max(stats.kickback,0),100):0;
	validStats.accuracy=typeof stats.accuracy=='number'&&!isNaN(stats.accuracy)?Math.min(Math.max(stats.accuracy,0),100):0;

	validStats.weapon=typeof stats.weapon=='string'?stats.weapon:"gun";
	validStats.validate();
	return validStats;
}

function controlSafe(id,data){
	let req=validateRequest(data);
	if(req!=null){
		queueAction(id,req);
	}
}
function validateRequest(reqStr){
	let arr=reqStr.split(",");
	let req={};
	if(arr.length==5){
		req.move={};
		req.move.x=+arr[0];
		req.move.y=+arr[1];
		req.aim={};
		req.aim.x=+arr[2];
		req.aim.y=+arr[3];
		req.attack=(arr[4]==1);
	}else if(arr.length==3){
		req.move=null;
		req.aim={};
		req.aim.x=+arr[0];
		req.aim.y=+arr[1];
		req.attack=(arr[2]==1);
	}else{
		return null;
	}
	if(	req.move
		&&typeof req.move.x=='number'
		&&!isNaN(req.move.x)
		&&typeof req.move.y=='number'
		&&!isNaN(req.move.y)
		&&req.aim
		&&typeof req.aim.x=='number'
		&&!isNaN(req.aim.x)
		&&typeof req.aim.y=='number'
		&&!isNaN(req.aim.y)
		&&typeof req.attack=="boolean"){
		return new ControlRequest(new Vector(req.move),new Vector(req.aim),req.attack);
	}
	if(	req.move==null
		&&req.aim
		&&typeof req.aim.x=='number'
		&&!isNaN(req.aim.x)
		&&typeof req.aim.y=='number'
		&&!isNaN(req.aim.y)
		&&typeof req.attack=="boolean"){
		return new ControlRequest(null,new Vector(req.aim),req.attack);
	}
	return null
}
function queueAction(id,req){
	let user=getUser(id);
	if(user!=null&&user.player!=null){
		user.queue=req;
	}
}
function runQueue(){
	for(let i=0;i<users.length;i++){
		runAction(users[i]);
	}
}
function runAction(user){
	if(user.player!=null&&user.queue!=null){
		user.player.control(user.queue,gameRunner.state);
		//user.queue=null;
	}
}

function getUser(id){ //room for optimization here <<>>
	for(let i=0;i<users.length;i++){
		if(users[i].id==id){
			return users[i];
		}
	}
	return null;
}
function getPlayer(id){ //room for optimization here <<>>
	for(let i=0;i<users.length;i++){
		if(users[i].id==id){
			return users[i].player;
		}
	}
	return null;
}
function getGlobalState(){
	return gameRunner.state;
}
function getGlobalGame(){
	return gameRunner;
}

module.exports = function() { 
	this.registerUser=registerUser;
	this.spawnSafe=spawnSafe;
	this.controlSafe=controlSafe;
	this.createGame=createGame;
	this.runGame=runGame;
	this.users=users;
	this.disconnectUser=disconnectUser;
	this.getSettings=getSettings;
	this.getGlobalState=getGlobalState;
	this.getGlobalGame=getGlobalGame;
	this.suicideUser=suicideUser;
}