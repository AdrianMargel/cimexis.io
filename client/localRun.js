
var state=null;
var stateBaseline=null;
var settings=null;

var gameDisplay=new Display();
gameDisplay.connect();

var control=new Control();
control.connect(gameDisplay.canvas);

var previewDisplay=new PreviewDisplay();

setInterval(()=>{
	let dialog=getElm("io-spawn",document.body);
	if(dialog.style.display!="none"){
		let previewP=dialog.getPlayer(new Settings);
		previewDisplay.displayPreview(previewP);
	}

	if(!displaying){
		gameDisplay.displayHollow();
	}

	if(gameDisplay.following!=null){
		let move=new Vector();
		if(control.pressedKeys[87]){
			move.y-=10;
		}
		if(control.pressedKeys[83]){
			move.y+=10;
		}
		if(control.pressedKeys[65]){
			move.x-=10;
		}
		if(control.pressedKeys[68]){
			move.x+=10;
		}
		if(move.x==0&&move.y==0){
			move=null;
		}else{
			move.addVec(gameDisplay.following.pos);
		}
		let aim=new Vector(control.getMouse(gameDisplay.cam));
		aim.subVec(gameDisplay.following.pos);
		aim.nrmVec(100);
		aim.addVec(gameDisplay.following.pos);
		aim.addVec(gameDisplay.following.velo);
		let req=new ControlRequest(move,aim,control.mouseDown);
		let reqStr=req.getString();
		byteEstimateUp+=byteCount(reqStr);
		socket.emit("control",reqStr);
	}
}, 1000/10);

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

var spawnStats={
	sight: 25,
	speed: 0,
	reload: 100,
	bulletSize: 100,
	weapon: "mini gun"
};

function getPlayerByUid(uid){
	for(let i=0;i<stateBaseline.playersList.length;i++){
		if(stateBaseline.playersList[i].uid==uid){
			return stateBaseline.playersList[i];
		}
	}
	return null;
}

const socket = io();

function spawnIn(){
	let dialog=getElm("io-spawn",document.body);
	if(dialog){
		let toSpawn=dialog.getPlayer(new Settings);
		//console.log({username: toSpawn.username,color:toSpawn.color,stats: toSpawn.stats});
    	socket.emit("spawn",{username: toSpawn.username,color:"#"+toSpawn.color,stats: toSpawn.stats});
    	dialog.classList.add("closed");
    	getElm("#mainTitle",document.body).classList.add("closed");
    	getElm("#canvasContainer",document.body).classList.remove("blur");
    	setTimeout(()=>{setFullHide(true)}, 1000);
	}
}
function setFullHide(toggle){
	let dialog=getElm("io-spawn",document.body);
	if(dialog){
		if(toggle){
			dialog.style.display="none";
	    	getElm("#mainTitle",document.body).style.display="none";
		}else{
			dialog.style.display="";
	    	getElm("#mainTitle",document.body).style.display="";
		}
	}
}
function reset(){
	let dialog=getElm("io-spawn",document.body);
    setFullHide(false);
	if(dialog){
    	setTimeout(()=>{
			dialog.classList.remove("closed");
	    	getElm("#mainTitle",document.body).classList.remove("closed");
	    	getElm("#canvasContainer",document.body).classList.add("blur");
		}, 10);
	}
}

socket.on('settings', (data) => {
	settings=data;
});
socket.on('killed', (data) => {
	reset();
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