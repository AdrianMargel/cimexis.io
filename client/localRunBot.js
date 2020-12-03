
var state=null;
var stateBaseline={};
var settings=null;

var gameDisplay=new Display();
gameDisplay.connect();

let Bot=null;
let playerBot=null;

var starterCode=
`
Bot=class{
	constructor(){

		//EDIT THE CODE BELOW:

		this.username="Bot";
		this.color="#0087E8";
		this.stats={
			weapon: "gun",
			sight: 25,
			speed: 50,
			reload: 100,
			bulletSize: 100,
			bulletSpeed: 100,
			regen: 25
		};
	}
	control(){
		
		//EDIT THE CODE BELOW:
		
		//shoot at and run towards closest player
		let closestPlayer=getClosest(getPlayerList());
		runAt(closestPlayer);
		shootAt(closestPlayer);
		
		//if there is no player in sight
		if(closestPlayer==null){
			//move to a position on the map
			let desiredPos=new Vector(20,20);
			//if the distance is 
			if(getDist(desiredPos)>5){
				runAt(desiredPos);
				shootFrom(desiredPos);
			}
		}
	}
	spawn(){
		//do not edit
		return {
			username: this.username,
			color: this.color,
			stats: this.stats
		}
	}
}
`;

var editor = CodeMirror(document.getElementById("editorCode"),{
	value: starterCode,
	mode: "javascript",
	tabSize: 2,
	indentWithTabs: true
});

function resetCode(){
	editor.setValue(starterCode);
}
function runCode(){
	eval(editor.getValue());
	playerBot=new Bot();
}

setInterval(()=>{
	if(!displaying){
		gameDisplay.displayHollow();
	}

	if(gameDisplay.following!=null){
		let tarPlayer=getPlayerByUid(state.playerUid);
		prime(tarPlayer,state,settings);
		playerBot.control();
		let req=complete();
		let reqStr=req.getString();
		byteEstimateUp+=byteCount(reqStr);
		socket.emit("control",reqStr);
	}
}, 1000/10);

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {  
      document.documentElement.requestFullScreen();  
    } else if (document.documentElement.mozRequestFullScreen) {  
      document.documentElement.mozRequestFullScreen();  
    } else if (document.documentElement.webkitRequestFullScreen) {  
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
    }
    getElm(".fullScreenBtn").style.display="none";
  } else {  
    if (document.cancelFullScreen) {  
      document.cancelFullScreen();  
    } else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
    } else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
    }  
  }
}
function openFullScreen(){
	if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
	   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
	    if (document.documentElement.requestFullScreen) {  
	      document.documentElement.requestFullScreen();  
	    } else if (document.documentElement.mozRequestFullScreen) {  
	      document.documentElement.mozRequestFullScreen();  
	    } else if (document.documentElement.webkitRequestFullScreen) {  
	      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
	    }
	    getElm(".fullScreenBtn").style.display="none";
	}
}
document.addEventListener('fullscreenchange', changeFullscreen, false);
document.addEventListener('mozfullscreenchange', changeFullscreen, false);
document.addEventListener('MSFullscreenChange', changeFullscreen, false);
document.addEventListener('webkitfullscreenchange', changeFullscreen, false);

function changeFullscreen(){
	if (!((document.fullScreenElement && document.fullScreenElement !== null) ||    
   		(!document.mozFullScreen && !document.webkitIsFullScreen))) {
    	getElm(".fullScreenBtn").style.display="";
	}
}

var displaying=true;
var last;
var totalElapsed=0;
function primeAnimation(state){
	gameDisplay.newState(state);
	totalElapsed=0;
}
function animation(timestamp) {
	if(last===undefined){
		last=timestamp;
	}
	let elapsed=timestamp-last;
	let runSpeed=1000/10;
	let animAmount=elapsed/runSpeed;
	last=timestamp;
	totalElapsed+=animAmount;
	if(totalElapsed>1){
		animAmount=0;
	}

	if(state!=null&&settings!=null){
		if(state.playerUid!=null){
			gameDisplay.setFollow(state.playerUid);
		}
		gameDisplay.display(settings,animAmount);
	}else{
		gameDisplay.displayHollow();
	}

	if(displaying){
		window.requestAnimationFrame(animation);
	}
}
window.requestAnimationFrame(animation);

function displayMinimap(){
	if(state!=null&&settings!=null){
		if(gameDisplay.following!=null){
			gameDisplay.displayMinimap(stateBaseline.minimap,settings);
		}
	}
}

var spawnStats={
	sight: 25,
	speed: 0,
	reload: 100,
	bulletSize: 100,
	weapon: "mini gun"
};

function getPlayerByUid(uid){
	if(stateBaseline!=null&&stateBaseline.playersList!=null){
		for(let i=0;i<stateBaseline.playersList.length;i++){
			if(stateBaseline.playersList[i].uid==uid){
				return stateBaseline.playersList[i];
			}
		}
	}
	return null;
}

const socket = io();

function spawnIn(){
	runCode();
	let toSpawn=playerBot.spawn();
    socket.emit("suicide",toSpawn);
    setTimeout(()=>{
    	socket.emit("spawn",toSpawn);
    	getElm("#canvasContainer",document.body).classList.remove("blur");
    }, 500);
}
function reset(){
    getElm("#canvasContainer",document.body).classList.add("blur");
}

socket.on('settings', (data) => {
	settings=data;
});
socket.on('killed', (data) => {
	//reset();
	gameDisplay.following=null;
});
socket.on('meta', (data) => {
	if(stateBaseline!=null){
		stateBaseline.scoreboard=data.scoreboard;
		stateBaseline.minimap=data.minimap;
		for(let i=0;i<stateBaseline.scoreboard.length;i++){
			let playerMatch=getPlayerByUid(stateBaseline.scoreboard[i].uid);
			if(playerMatch!=null){
				stateBaseline.scoreboard[i].username=playerMatch.username;
			}
		}
		let sb=getElm("io-scoreboard.scoreboard",document.body);
		sb.update(stateBaseline.scoreboard);
		displayMinimap();

		let updateSize=byteCount(JSON.stringify(data));
		byteEstimateDown+=updateSize;
	}
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
	primeAnimation(state);
    //state=data;
});
var stateString="";//for debugging
var byteEstimateDown=0;//for debugging
var byteEstimateUp=0;

function parseStateBaseline(str){
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