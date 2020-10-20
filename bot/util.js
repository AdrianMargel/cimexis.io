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

module.exports = function() {
	this.Vector=Vector;
	this.nrmAng=nrmAng;
	this.nrm2Ang=nrm2Ang;
	this.ControlRequest=ControlRequest;
}