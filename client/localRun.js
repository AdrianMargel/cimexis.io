
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
	if(dialog){
		let previewP=dialog.getPlayer(new Settings);
		previewDisplay.displayPreview(previewP);
	}

	if(state!=null&&settings!=null){
		if(state.playerUid!=null){
			gameDisplay.setFollow(getPlayerByUid(state.playerUid));
		}
		gameDisplay.display(state,settings);
	}else{
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
		let req=new ControlRequest(move,aim,control.mouseDown);
		let reqStr=req.getString();
		byteEstimateUp+=byteCount(reqStr);
		socket.emit("control",reqStr);
	}
}, 50);


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
		console.log({username: toSpawn.username,color:toSpawn.color,stats: toSpawn.stats});
    	socket.emit("spawn",{username: toSpawn.username,color:"#"+toSpawn.color,stats: toSpawn.stats});
    	dialog.remove();
    	getElm("#mainTitle",document.body).remove();
	}
}

socket.on('settings', (data) => {
	settings=data;
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
        target.rot=+arrRaw[index];
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