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


function overlayColor(base,over){
	let overRGB=hexToRgb(over);
	let overHSV=RGBtoHSV(overRGB.r,overRGB.g,overRGB.b);
	overHSV.v=Math.min(overHSV.v,0.9);
	overRGB=HSVtoRGB(overHSV.h,overHSV.s,overHSV.v);
	
	let baseRGB=hexToRgb(base);
	overRGB.r/=256;
	overRGB.g/=256;
	overRGB.b/=256;
	baseRGB.r/=256;
	baseRGB.g/=256;
	baseRGB.b/=256;
	overRGB.r=overlayPart(baseRGB.r,overRGB.r);
	overRGB.g=overlayPart(baseRGB.g,overRGB.g);
	overRGB.b=overlayPart(baseRGB.b,overRGB.b);
	overRGB.r=Math.floor(overRGB.r*256);
	overRGB.g=Math.floor(overRGB.g*256);
	overRGB.b=Math.floor(overRGB.b*256);
	
	return rgbToHex(overRGB.r,overRGB.g,overRGB.b);
}
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}
function overlayPart(bV,oV){
	if(bV>0.5){
		return (1-(1-2*(bV-0.5)) * (1-oV));
	}else{
		return ((2*bV) * oV);
	}
}
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function isHex(h) {
	if(typeof h != "string"){
		return false;
	}
	if(h.substring(0, 1)!="#"||h.length!=7){
		return false;
	}
	let h2=h.substring(1);
	let a = parseInt(h2,16);
	let aStr=a.toString(16);
	while(aStr.length<6){
		aStr="0"+aStr;
	}
	return (aStr===h2.toLowerCase())
}

function clone(target){
	return JSON.parse(JSON.stringify(target));
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