class Vector {
	//float x;
	//float y;
	constructor(a, b, angleInit) {
		if(arguments.length==3){
			if(angleInit){
				this.x=Math.cos(a)*b;
				this.y=Math.sin(a)*b;
			}else{
				this.x=a;
				this.y=b;
			}
		}else if(arguments.length==2){
			this.x=a;
			this.y=b;
		}else if(arguments.length==1){
			this.x=a.x;
			this.y=a.y;
		}else{
			this.x=0;
			this.y=0;
		}
	}
	addVec(vec) {
		this.x+=vec.x;
		this.y+=vec.y;
	}
	subVec(vec) {
		this.x-=vec.x;
		this.y-=vec.y;
	}
	sclVec(scale) {
		this.x*=scale;
		this.y*=scale;
	}
	nrmVec(mag) {
		if(arguments.length==1){
			let ang=this.getAng();
			this.x=Math.cos(ang)*mag;
			this.y=Math.sin(ang)*mag;
		}else{
			let ang=this.getAng();
			this.x=Math.cos(ang);
			this.y=Math.sin(ang);
		}
	}
	limVec(lim) {
		let mag=this.getMag();
		if (mag>lim) {
			this.sclVec(lim/mag);
		}
	}
	getAng(vec) {
		if(arguments.length==1){
			return Math.atan2(vec.y-this.y, vec.x-this.x);
		}else{
			return Math.atan2(this.y, this.x);
		}
	}
	getMag(vec) {
		if(arguments.length==1){
			return Math.sqrt(Math.pow(vec.x-this.x,2)+Math.pow(vec.y-this.y,2));
		}else{
			return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2));
		}
	}
	rotVec(rot,pin) {
		if(arguments.length==2){
			this.subVec(pin);
			let mag=this.getMag();
			let ang=this.getAng();
			ang+=rot;
			this.x=Math.cos(ang)*mag;
			this.y=Math.sin(ang)*mag;
			this.addVec(pin);

		}else{
			let mag=this.getMag();
			let ang=this.getAng();
			ang+=rot;
			this.x=Math.cos(ang)*mag;
			this.y=Math.sin(ang)*mag;
		}
	}
	minVec(min){
		this.x=Math.min(this.x,min.x);
		this.y=Math.min(this.y,min.y);
	}
	maxVec(max){
		this.x=Math.max(this.x,max.x);
		this.y=Math.max(this.y,max.y);
	}
	inRange(vec,dist){
		let diffX=Math.abs(vec.x-this.x);
		if(diffX>dist){
			return false;
		}
		let diffY=Math.abs(vec.y-this.y);
		if(diffY>dist){
			return false;
		}
		return Math.sqrt(Math.pow(diffX,2)+Math.pow(diffY,2))<=dist;
	}
	setVec(vec){
		this.x=vec.x;
		this.y=vec.y;
	}
}

function nrmAng(ang){
  let newAng=ang;
  while(newAng<0){
    newAng+=2*Math.PI;
  }
  while(newAng>2*Math.PI){
    newAng-=2*Math.PI;
  }
  return newAng;
}
function nrm2Ang(ang){
  let newAng=ang;
  while(newAng<-Math.PI){
    newAng+=2*Math.PI;
  }
  while(newAng>Math.PI){
    newAng-=2*Math.PI;
  }
  return newAng;
}

class ControlRequest{
	constructor(move,aim,attack){
		this.move=move;
		this.aim=aim;
		this.attack=attack;
	}
	getString(){
		let rounding=4;
		if(this.move!=null){
			let arr=[this.move.x.toFixed(rounding),this.move.y.toFixed(rounding),this.aim.x.toFixed(rounding),this.aim.y.toFixed(rounding),this.attack? 1:0];
			return arr.toString();
		}
		let arr=[this.aim.x.toFixed(rounding),this.aim.y.toFixed(rounding),this.attack? 1:0];
		return arr.toString();
	}
}

var _move;
var _aim;
var _attack;
var _controllingPlayer;
var _visibleState;
var _settings;

function prime(controllingPlayer,visibleState,settings){
	_controllingPlayer=controllingPlayer;
	_controllingPlayer.pos=new Vector(_controllingPlayer.pos);
	_visibleState=visibleState;
	_settings=settings;

	_move=null;
	_aim=new Vector(0,0);
	_attack=false;
}
function complete(){
	return new ControlRequest(_move,_aim,_attack);
}

function getDist(tar){
	if(tar.pos){
		return _controllingPlayer.pos.getMag(tar.pos);
	}else if(typeof tar.x=="number" && typeof tar.y=="number"){
		return _controllingPlayer.pos.getMag(tar);
	}
	return null;
}
function getState(){
	return _visibleState;
}
function getPlayerList(includePlayer){
	if(includePlayer==null||!includePlayer){
		let pList=_visibleState.playersList.slice(0, _visibleState.playersList.length);
		pList=pList.filter(player => player.uid!=_controllingPlayer.uid);
		return pList;
	}
	return _visibleState.playersList;
}
function getBulletList(){
	return _visibleState.bulletsList;
}
function getBulletListEnemy(){
	let bList=_visibleState.bulletsList.slice(0, _visibleState.bulletsList.length);
	bList=bList.filter(bullet => bullet.shooterUid!=_controllingPlayer.uid);
	return bList;
}
function getBulletListFriendly(){
	let bList=_visibleState.bulletsList.slice(0, _visibleState.bulletsList.length);
	bList=bList.filter(bullet => bullet.shooterUid==_controllingPlayer.uid);
	return bList;
}
function getClosest(tarList){
	if(tarList.length==0){
		return null;
	}
	let list=tarList.slice(0, tarList.length);
	let testPos=new Vector(_controllingPlayer.pos);
	let reducer=(accumulator, current) => {
		let aDist=testPos.getMag(accumulator.pos);
		let cDist=testPos.getMag(current.pos);
		if(aDist<cDist){
			return accumulator;
		}else{
			return current;
		}
	};
	return list.reduce(reducer);
}
function getFurthest(tarList){
	if(tarList.length==0){
		return null;
	}
	let list=tarList.slice(0, tarList.length);
	let testPos=new Vector(_controllingPlayer.pos);
	let reducer=(accumulator, current) => {
		let aDist=testPos.getMag(accumulator.pos);
		let cDist=testPos.getMag(current.pos);
		if(aDist>cDist){
			return accumulator;
		}else{
			return current;
		}
	};
	return list.reduce(reducer);
}
function getPlayer(){
	return _controllingPlayer;
}
function runAt(tar){
	if(tar==null){
		return;
	}
	if(tar.pos){
		let move=new Vector(tar.pos);
		_move=move;
	}else if(typeof tar.x=="number" && typeof tar.y=="number"){
		let move=new Vector(tar);
		_move=move;
	}
}
function runFrom(tar){
	if(tar==null){
		return;
	}
	if(tar.pos){
		let move=new Vector(tar.pos);
		move.subVec(_controllingPlayer.pos);
		move.sclVec(-1);
		move.addVec(_controllingPlayer.pos);
		_move=move;
	}else if(typeof tar.x=="number" && typeof tar.y=="number"){
		let move=new Vector(tar);
		move.subVec(_controllingPlayer.pos);
		move.sclVec(-1);
		move.addVec(_controllingPlayer.pos);
		_move=move;
	}
}
function strafeAt(tar,direction){
	if(tar==null){
		return;
	}
	let rot=direction?Math.PI/2:-Math.PI/2;
	if(tar.pos){
		let move=new Vector(tar.pos);
		move.subVec(_controllingPlayer.pos);
		move.rotVec(rot);
		move.addVec(_controllingPlayer.pos);
		_move=move;
	}else if(typeof tar.x=="number" && typeof tar.y=="number"){
		let move=new Vector(tar);
		move.subVec(_controllingPlayer.pos);
		move.rotVec(rot);
		move.addVec(_controllingPlayer.pos);
		_move=move;
	}
}
function stabilizeMovement(amount){
	if(_move==null){
		return;
	}
	let move=new Vector(_move);
	move.subVec(_controllingPlayer.pos);
	if(amount!=null){
		move.sclVec(amount);
	}else{
		move.sclVec(5);
	}
	move.addVec(_controllingPlayer.pos);
	_move=move;
}
function shootAt(tar){
	if(tar==null){
		return;
	}
	_attack=true;
	if(tar.pos){
		let aim=new Vector(tar.pos);
		_aim=aim;
	}else if(typeof tar.x=="number" && typeof tar.y=="number"){
		let aim=new Vector(tar);
		_aim=aim;
	}
}
function shootFrom(tar){
	if(tar==null){
		return;
	}
	_attack=true;
	if(tar.pos){
		let aim=new Vector(tar.pos);
		aim.subVec(_controllingPlayer.pos);
		aim.sclVec(-1);
		aim.addVec(_controllingPlayer.pos);
		_aim=aim;
	}else if(typeof tar.x=="number" && typeof tar.y=="number"){
		let aim=new Vector(tar);
		aim.subVec(_controllingPlayer.pos);
		aim.sclVec(-1);
		aim.addVec(_controllingPlayer.pos);
		_aim=aim;
	}
}
function getMapSize(){
	return new Vector(_settings.size);
}

module.exports = function() {
	this.Vector=Vector;
	this.nrmAng=nrmAng;
	this.nrm2Ang=nrm2Ang;
	this.ControlRequest=ControlRequest;
	this.prime=prime;
	this.complete=complete;
	this.getDist=getDist;
	this.getState=getState;
	this.getPlayerList=getPlayerList;
	this.getBulletList=getBulletList;
	this.getBulletListEnemy=getBulletListEnemy;
	this.getBulletListFriendly=getBulletListFriendly;
	this.getClosest=getClosest;
	this.getFurthest=getFurthest;
	this.getPlayer=getPlayer;
	this.runAt=runAt;
	this.runFrom=runFrom;
	this.strafeAt=strafeAt;
	this.stabilizeMovement=stabilizeMovement;
	this.shootAt=shootAt;
	this.shootFrom=shootFrom;
	this.getMapSize=getMapSize;
}