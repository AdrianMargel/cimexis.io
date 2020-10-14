var canvas=document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasContainer=document.getElementById("canvasContainer");

var mapCanvas=document.getElementById("mapCanvas");
var mapCtx = mapCanvas.getContext("2d");

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
    	this.sclVec(mag/this.getMag());
	}else{
    	this.sclVec(1/this.getMag());
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


class Chunk{
	constructor(cPos){
		this.prime();
		this.pos=new Vector(cPos);
	}

	prime(){
		this.players=[];
	}
	write(player){
		this.players.push(player);
	}
	getPlayers(){
		return this.players;
	}
	getCount(){
		return this.players.length;
	}
	display(){
		ctx.lineWidth = 0.1*zoomSetting;
		ctx.strokeStyle="#00ff00";
		ctx.beginPath();
		ctx.rect((this.pos.x*chunkSize-camSetting.x)*zoomSetting, (this.pos.y*chunkSize-camSetting.y)*zoomSetting,zoomSetting*chunkSize ,zoomSetting*chunkSize);
		ctx.stroke();

		ctx.fillStyle="#000000";
		ctx.fillText(this.players.length,((this.pos.x+0.5)*chunkSize-camSetting.x)*zoomSetting, ((this.pos.y+0.5)*chunkSize-camSetting.y)*zoomSetting);
	}
}
class Player{
	constructor(username,color,stats,startPos){
		this.username=username;
		this.stats=stats;
		this.colorDark=overlayColor("#939393",color);
		this.colorLight=overlayColor("#AFAFAF",color);

		this.pos=new Vector(startPos);
		this.velo=new Vector();
		this.rot=0;

		this.healthMax=this.stats.getHealth();
		this.health=this.healthMax;
		this.regen=this.stats.getRegen();
		this.speed=this.stats.getSpeed();
		this.size=this.stats.getSize();
		this.sight=this.stats.getSight();

		this.meleeDamage=this.stats.getMeleeDamage();

		this.reload=this.stats.getReload();
		this.reloadWait=1;
		this.damage=this.stats.getDamage();
		this.range=this.stats.getRange();
		this.bulletSpeed=this.stats.getBulletSpeed();
		this.bulletSize=this.stats.getBulletSize();
		this.knockback=this.stats.getKnockback();
		this.accuracy=this.stats.getAccuracy();

		this.weapon=this.stats.getWeapon();

		this.friction=0.8;
	}

	repel(){
		let hitBox=new Vector(this.size/2,this.size/2);
		let testPos=new Vector(this.pos);
		testPos.subVec(hitBox);
		hitBox.sclVec(2);
		let overlap=getChunks(testPos,hitBox);

		let players=[];
		for(let i=0;i<overlap.length;i++){
			players=players.concat(overlap[i].getPlayers());
		}

		//remove duplicates
		for(let i=players.length-1;i>=0;i--){
			for(let j=i-1;j>=0;j--){
				if(players[i]==players[j]){
					players.splice(j,1);
					break;
				}
			}
		}

		//hit players
		for(let i=0;i<players.length;i++){
			let hitDist=players[i].size/2+this.size/2;
			let realDist=players[i].pos.getMag(this.pos);
			if(hitDist>realDist&&players[i]!=this){
				let push=new Vector(players[i].pos);
				push.subVec(new Vector(this.pos));
				let force=(1-realDist/hitDist)*0.2;

				push.nrmVec(force);
				players[i].nudge(push);
				players[i].hit(this.meleeDamage,this);
			}
		}
	}
	control(req){
		if(req.move){
			let newVelo=new Vector(req.move);
			newVelo.subVec(this.pos);
			newVelo.limVec(this.speed);
			this.velo.addVec(newVelo);
		}
		let ang=this.pos.getAng(req.aim);
		this.rot=ang;
		if(req.attack&&this.reloadWait<=0){
			let aim=new Vector(req.aim);
			this.weapon.shoot(this,aim,false);
			this.reloadWait=1;
		}
	}
	nudge(vec){
		this.velo.addVec(vec);
	}
	push(vec,strength){
		let partA=new Vector(this.velo);
		partA.sclVec(1-strength);
		let partB=new Vector(vec);
		partB.sclVec(strength);

		partA.addVec(partB);
		this.velo=partA;
	}
	move(){
		this.reloadWait=Math.max(this.reloadWait-this.reload, 0);
		this.health=Math.min(this.health+this.regen, this.healthMax);
		this.pos.addVec(this.velo);
		this.velo.sclVec(this.friction);
		let negSize=new Vector(size);
		negSize.sclVec(-1);
		this.pos.minVec(size);
		this.pos.maxVec(negSize);
	}
	write(){
		let hitBox=new Vector(this.size/2,this.size/2);
		let testPos=new Vector(this.pos);
		testPos.subVec(hitBox);
		hitBox.sclVec(2);
		let overlap=getChunks(testPos,hitBox);

		let players=[];
		for(let i=0;i<overlap.length;i++){
			overlap[i].write(this);
		}
	}
	hit(damage,hitter){
		this.health=Math.max(this.health-damage,0);
	}
	isDead(){
		return this.health<=0;
	}
	getHealthPercent(){
		return this.health/this.healthMax;
	}
	display(zoom){
		//this.drawSight(zoom);
		ctx.font = "700 "+1*zoom+"px Nunito";
		ctx.textAlign = "center";
		ctx.fillStyle= "#6D6862";
		ctx.fillText(this.username, (this.pos.x-camSetting.x)*zoom, (this.pos.y+this.size/2+1.1-camSetting.y)*zoom); 

		let healthBarY=this.size/2+1.6;
		let healthBarWide=1.5*this.getHealthPercent();
		ctx.lineWidth = 0.25*zoom;
		ctx.beginPath();
		ctx.moveTo((this.pos.x-camSetting.x-healthBarWide)*zoom, (this.pos.y+healthBarY-camSetting.y)*zoom);
		ctx.lineTo((this.pos.x-camSetting.x+healthBarWide)*zoom, (this.pos.y+healthBarY-camSetting.y)*zoom);
		ctx.fill();

		let barChange=Math.min(Math.max((this.getHealthPercent()-0.3)*2,0),1);
		let barCol=c0lor.hsv(0.4*barChange, 0.9, 0.8);
		ctx.strokeStyle ="#"+barCol.rgb().RGB().hex();
		ctx.stroke();

		ctx.lineWidth = 0.2*zoom;
		ctx.strokeStyle="#939393";
		ctx.fillStyle="#AFAFAF";
		ctx.translate((this.pos.x-camSetting.x)*zoom, (this.pos.y-camSetting.y)*zoom);
		ctx.rotate(this.rot);
		if(this.weapon.name=="basic gun"){
			ctx.fillRect((this.size/2-1)*zoom,-0.5*zoom,2*zoom,1*zoom);
			ctx.strokeRect((this.size/2-1)*zoom,-0.5*zoom,2*zoom,1*zoom);
		}
		ctx.rotate(-this.rot);
		ctx.translate(-(this.pos.x-camSetting.x)*zoom, -(this.pos.y-camSetting.y)*zoom);

		ctx.strokeStyle = this.colorDark;
		ctx.fillStyle= this.colorLight;
		ctx.beginPath();
		ctx.arc((this.pos.x-camSetting.x)*zoom, (this.pos.y-camSetting.y)*zoom, this.size/2*zoom, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	}
	drawSight(zoom){
		let strokeWeight=0.2;
		ctx.lineWidth = strokeWeight*zoom;
		ctx.setLineDash([25, 25]);
		ctx.strokeStyle="#B5A78B";

		ctx.beginPath();
		ctx.arc((this.pos.x-camSetting.x)*zoom, (this.pos.y-camSetting.y)*zoom, this.sight/2*zoom, 0, 2 * Math.PI);
		ctx.stroke();

		// ctx.lineWidth = 0.2*zoom;
		// ctx.beginPath();
		// ctx.moveTo((this.pos.x-camSetting.x)*zoom, (this.pos.y-camSetting.y)*zoom);
		// ctx.lineTo((this.pos.x-camSetting.x+this.sight/2)*zoom, (this.pos.y-camSetting.y)*zoom);
		// ctx.stroke();
		ctx.setLineDash([]);

		var maskCanvas = document.createElement('canvas');
		maskCanvas.width = canvas.width;
		maskCanvas.height = canvas.height;
		var maskCtx = maskCanvas.getContext('2d');
		maskCtx.fillStyle = "#EFE9D7";
		maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
		maskCtx.globalCompositeOperation = 'xor';
		maskCtx.arc((this.pos.x-camSetting.x)*zoom, (this.pos.y-camSetting.y)*zoom, (this.sight/2+strokeWeight/2)*zoom, 0, 2 * Math.PI);
		maskCtx.fill();
        ctx.globalAlpha = 0.4;
		ctx.drawImage(maskCanvas, 0, 0);
        ctx.globalAlpha = 1;
	}
}
class Bullet{
	constructor(shooter,pos,velo, life,size,damage,knockback){
		this.shooter=shooter;
		this.pos=new Vector(pos);
		this.velo=new Vector(velo);

		this.life=life;
		this.size=size;
		this.damage=damage;
		this.knockback=knockback;

		this.colorDark=shooter.colorDark;
		this.colorLight=shooter.colorLight;
	}

	move(time){
		let moveVec=new Vector(this.velo);
		moveVec.sclVec(time);
		this.pos.addVec(moveVec);

		let negSize=new Vector(size);
		negSize.sclVec(-1);
		if(this.pos.x<negSize.x||this.pos.x>size.x){
			this.velo.x*=-0.8;
		}
		if(this.pos.y<negSize.y||this.pos.y>size.y){
			this.velo.y*=-0.8;
		}
		this.pos.minVec(size);
		this.pos.maxVec(negSize);

		this.life=Math.max(this.life-1*time,0);
	}
	hit(){
		if(!this.isDead()){
			let hitBox=new Vector(this.size/2,this.size/2);
			let testPos=new Vector(this.pos);
			testPos.subVec(hitBox);
			hitBox.sclVec(2);
			let overlap=getChunks(testPos,hitBox);

			let players=[];
			for(let i=0;i<overlap.length;i++){
				players=players.concat(overlap[i].getPlayers());
			}

			//remove duplicates
			for(let i=players.length-1;i>=0;i--){
				for(let j=i-1;j>=0;j--){
					if(players[i]==players[j]){
						players.splice(j,1);
						break;
					}
				}
			}

			//hit players
			for(let i=0;i<players.length;i++){
				let hitDist=players[i].size/2+this.size/2;
				let realDist=players[i].pos.getMag(this.pos);
				if(hitDist>=realDist&&players[i]!=this.shooter){
					this.hitPlayer(players[i]);
					break;
				}
			}
		}
	}
	hitPlayer(target){
		let knock=new Vector(this.velo);

		target.push(knock,this.knockback);
		target.hit(this.damage,this.shooter);
		this.kill();
	}
	kill(){
		this.life=0;
	}
	isDead(){
		return this.life<=0;
	}

	display(zoom){
		ctx.strokeStyle = this.colorDark;
		ctx.fillStyle = this.colorLight;
		ctx.lineWidth = 0.1*zoom;
		ctx.beginPath();
		ctx.arc((this.pos.x-camSetting.x)*zoom, (this.pos.y-camSetting.y)*zoom, this.size/2*zoom, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	}

}

class Stats{
	//int health
	//int regen
	//int speed
	//int size
	//int sight

	//int reload
	//int damage
	//int range
	//int bulletSpeed
	//int bulletSize

	//string weapon
	constructor(){
		this.health=25;
		this.regen=25;
		this.speed=25;
		this.size=0;
		this.sight=25;

		this.meleeDamage=25;

		this.reload=25;
		this.damage=25;
		//this.range=100;
		this.bulletSpeed=25;
		this.bulletSize=25;
		this.knockback=25;
		this.accuracy=25;

		this.weapon="basic gun";
	}

	getHealth(){
		let val=this.health/100;
		let min=80;
		let max=200;
		return val*(max-min)+min;
	}
	getRegen(){
		let val=this.regen/100;
		let min=0;
		let max=0.2;
		return val*(max-min)+min;
	}
	getSpeed(){
		let val=this.speed/100;
		let min=0.02;
		let max=0.15;
		return val*(max-min)+min;
	}
	getSize(){
		let val=this.size/100;
		let min=2;
		let max=5;
		return val*(max-min)+min;
	}
	getSight(){
		let val=this.sight/100;
		let min=50;
		let max=100;
		return val*(max-min)+min;
	}

	getMeleeDamage(){
		let val=this.meleeDamage/100;
		let min=1;
		let max=5;
		return val*(max-min)+min;
	}

	getReload(){
		let val=this.reload/100;
		let min=0.01;
		let max=0.25;
		return val*(max-min)+min;
	}
	getDamage(){
		let val=this.damage/100;
		let min=5;
		let max=20;
		return val*(max-min)+min;
	}
	getRange(){
		// let val=this.range/100;
		// let min=80;
		// let max=120;
		// return val*(max-min)+min;
		return 60;
	}
	getBulletSpeed(){
		let val=this.bulletSpeed/100;
		let min=0.5;
		let max=1.2;
		return val*(max-min)+min;
	}
	getBulletSize(){
		let val=this.bulletSize/100;
		let min=0.8;
		let max=1.5;
		return val*(max-min)+min;
	}
	getKnockback(){
		let val=this.knockback/100;
		let min=0.2;
		let max=1;
		return val*(max-min)+min;
	}
	getAccuracy(){
		let val=this.accuracy/100;
		let min=0.15;
		let max=0;
		return val*(max-min)+min;
	}

	getWeapon(){
		for(let i=0;i<weaponsList.length;i++){
			if(weaponsList[i].name==this.weapon){
				return weaponsList[i];
			}
		}
		return weaponsList[0];
	}
}
class ControlRequest{
	//Vector move
	//Vector aim
	//boolean attack
	constructor(move,aim,attack){
		this.move=move;
		this.aim=aim;
		this.attack=attack;
	}
}
class Weapon{
	constructor(){
		this.name="basic gun";
	}
	shoot(shooter, target, speedAdjust){
		let bulletSpeed=shooter.bulletSpeed;
		let range=shooter.range;
		let bulletSize=shooter.bulletSize;
		let damage=shooter.damage;
		let knockback=shooter.knockback;
		let accuracy=shooter.accuracy;

		let pos=new Vector(shooter.pos);
		let velo=new Vector(target);
		velo.subVec(pos);
		velo.limVec(bulletSpeed);

		let ang=velo.getAng();
		let offset=new Vector(ang,shooter.size/2,true);
		pos.addVec(offset);

		if(speedAdjust){
			let mag=velo.getMag();
			let ang=velo.getAng()+(Math.random()*2-1)*accuracy;
			velo=new Vector(shooter.velo);
			velo.addVec(new Vector(ang,mag,true));
			velo.limVec(bulletSpeed);
		}else{
			let mag=velo.getMag();
			let ang=velo.getAng()+(Math.random()*2-1)*accuracy;
			velo=new Vector(ang,mag,true);
		}

		bulletsList.push(new Bullet(shooter,pos,velo, range,bulletSize,damage,knockback));
	}
}

var weaponsList=[];
var chunks=[];
var playersList=[];
var bulletsList=[];
var requestQueue=[];

var size=new Vector(100,100);
var chunkSize=5;

var canvasSize=new Vector(1200,1200);
var zoomSetting=5;
var camSetting=new Vector(0,0);
var following=null;
var mapCanvasSize=new Vector(200,200);

var timer=0;

function setup(){
	updateSize();
	weaponsList.push(new Weapon());//default gun is at index 0

	let chunkDims=new Vector(size);
	chunkDims.sclVec(1/chunkSize);
	for(let x=-chunkDims.x;x<chunkDims.x;x++){
		let chunkCol=[];
		for(let y=-chunkDims.y;y<chunkDims.y;y++){
			let toAdd=new Chunk(new Vector(x,y));
			chunkCol.push(toAdd);
		}
		chunks.push(chunkCol);
	}

	demoStats=new Stats();
	demoStats.speed=50;
	//demoStats.sight=30;
	demoStats.regen=100;
	following=new Player("Franklin","#29A819",demoStats,new Vector(0,0));
	
	playersList.push(following);
	
	for(let i=0;i<10;i++){
		playersList.push(new Player("username","#E51616",new Stats(),new Vector(Math.random()*200-100,Math.random()*200-100) ));
	}
}
function run(){
	timer++;
	mousePos=new Vector(mousePosReal);
	mousePos.sclVec(1/zoomSetting);
	mousePos.addVec(camSetting);

	for(let x=0;x<chunks.length;x++){
		for(let y=0;y<chunks[x].length;y++){
			chunks[x][y].prime();
		}
	}

	for(let i=0;i<playersList.length;i++){
		let move=new Vector();
		if(pressedKeys[87]){
			move.y--;
		}
		if(pressedKeys[83]){
			move.y++;
		}
		if(pressedKeys[65]){
			move.x--;
		}
		if(pressedKeys[68]){
			move.x++;
		}
		if(i==0){
			move.addVec(playersList[i].pos);
			let aim=new Vector(mousePos);
			playersList[i].control(new ControlRequest(move,aim,mouseDown));
		}else{
			if(timer%100==(i*10)%50|| timer==1){
				move=new Vector(Math.random()*Math.PI*2,Math.random()*400,true);
				let aim=new Vector(move);
				aim.sclVec(1.1);
				playersList[i].tempCR=new ControlRequest(move,aim,true);
			}
			playersList[i].control(playersList[i].tempCR);
		}
	}
	for(let i=0;i<playersList.length;i++){
		playersList[i].move();
		playersList[i].write();
	}
	for(let i=0;i<playersList.length;i++){
		playersList[i].repel();
	}
	for(let i=0;i<bulletsList.length;i++){
		if(bulletsList[i].velo.getMag()>bulletsList[i].size){
			bulletsList[i].move(0.5);
			bulletsList[i].hit();
			bulletsList[i].move(0.5);
			bulletsList[i].hit();
		}else{
			bulletsList[i].move(1);
			bulletsList[i].hit();
		}
	}

	//remove dead
	for(let i=playersList.length-1;i>=0;i--){
		if(playersList[i].isDead()){
			playersList.splice(i,1);
		}
	}
	for(let i=bulletsList.length-1;i>=0;i--){
		if(bulletsList[i].isDead()){
			bulletsList.splice(i,1);
		}
	}

	//display
	calcCam();
	displayMap(zoomSetting);
	for(let i=0;i<bulletsList.length;i++){
		bulletsList[i].display(zoomSetting);
	}
	for(let i=0;i<playersList.length;i++){
		playersList[i].display(zoomSetting);
	}
	following.drawSight(zoomSetting);
	displayMiniMap();
}
function updateSize(){
	let w=canvasContainer.offsetWidth;
	let h=canvasContainer.offsetHeight;
	canvasSize=new Vector(w,h);
	canvas.setAttribute("width",w);
	canvas.setAttribute("height",h);
}
function calcCam(){
	zoomSetting = Math.max(canvasSize.x,canvasSize.y)/(following.sight+5);
	camSetting=new Vector(following.pos);
	let offset=new Vector(canvasSize);
	offset.sclVec(0.5);
	offset.sclVec(1/zoomSetting);
	camSetting.subVec(offset);
}
function displayMap(zoom){
	ctx.clearRect(0, 0, canvasSize.x, canvasSize.y);

	let lineWeight=0.2*zoom;
	ctx.lineCap="square";

	let edgeXMax=chunks.length*chunkSize/2;
	let edgeYMax=chunks[0].length*chunkSize/2;
	let edgeXMin=-edgeXMax;
	let edgeYMin=-edgeYMax;

	edgeXMax=(edgeXMax-camSetting.x)*zoom;
	edgeXMin=(edgeXMin-camSetting.x)*zoom;
	edgeYMax=(edgeYMax-camSetting.y)*zoom;
	edgeYMin=(edgeYMin-camSetting.y)*zoom;

	let offX1=(camSetting.x%chunkSize)*zoom;
	ctx.strokeStyle = "#E2D9C3";
	ctx.lineWidth = lineWeight;
	for(let x=-offX1;x<=canvasSize.x;x+=zoom*chunkSize){
		if(x<edgeXMax+1&&x>edgeXMin-1){
			ctx.beginPath();
			ctx.moveTo(x, Math.max(0,edgeYMin));
			ctx.lineTo(x, Math.min(canvasSize.y,edgeYMax));
			ctx.stroke();
		}
	}
	let offX2=(camSetting.x%(chunkSize*5))*zoom;
	ctx.lineWidth = 2*lineWeight;
	for(let x=-offX2;x<=canvasSize.x;x+=zoom*chunkSize*5){
		if(x<edgeXMax+1&&x>edgeXMin-1){
			ctx.beginPath();
			ctx.moveTo(x, Math.max(0,edgeYMin));
			ctx.lineTo(x, Math.min(canvasSize.y,edgeYMax));
			ctx.stroke();
		}
	}

	let offY1=(camSetting.y%chunkSize)*zoom;
	ctx.lineWidth = lineWeight;
	for(let y=-offY1;y<=canvasSize.y;y+=zoom*chunkSize){
		if(y<edgeYMax+1&&y>edgeYMin-1){
			ctx.beginPath();
			ctx.moveTo(Math.max(0,edgeXMin), y);
			ctx.lineTo(Math.min(canvasSize.x,edgeXMax), y);
			ctx.stroke();
		}
	}
	let offY2=(camSetting.y%(chunkSize*5))*zoom;
	ctx.lineWidth = 2*lineWeight;
	for(let y=-offY2;y<=canvasSize.y;y+=zoom*chunkSize*5){
		if(y<edgeYMax+1&&y>edgeYMin-1){
			ctx.beginPath();
			ctx.moveTo(Math.max(0,edgeXMin), y);
			ctx.lineTo(Math.min(canvasSize.x,edgeXMax), y);
			ctx.stroke();
		}
	}
	ctx.lineCap="butt";
}
function displayMiniMap(){
	mapCtx.clearRect(0,0,mapCanvasSize.x,mapCanvasSize.y);
	mapCtx.strokeStyle = "#6D6862";
	mapCtx.fillStyle = "#6D6862";
	mapCtx.lineWidth = 2;
	let wide=size.x*2+chunkSize;
	let high=size.y*2+chunkSize;
	let z=Math.min((mapCanvasSize.y/high),(mapCanvasSize.x/wide));
	for(let i=0;i<playersList.length;i++){
		let x=(playersList[i].pos.x+wide/2-chunkSize/2)*z;
		let y=(playersList[i].pos.y+high/2-chunkSize/2)*z;
		x=Math.floor(x/chunkSize)*chunkSize;
		y=Math.floor(y/chunkSize)*chunkSize;
		mapCtx.strokeRect(x,y,z*chunkSize,z*chunkSize);
	}
	{
		let x=(following.pos.x+wide/2-chunkSize/2)*z;
		let y=(following.pos.y+high/2-chunkSize/2)*z;
		x=Math.floor(x/chunkSize)*chunkSize;
		y=Math.floor(y/chunkSize)*chunkSize;
		mapCtx.fillRect(x,y,z*chunkSize,z*chunkSize);
	}
}
function getChunks(vec,size){
	vecMin=new Vector(vec);
	vecMax=new Vector(vec);
	vecMax.addVec(size);

	vecMin.sclVec(1/chunkSize);
	let xMin=Math.floor(vecMin.x+chunks.length/2);
	let yMin=Math.floor(vecMin.y+chunks[0].length/2);

	vecMax.sclVec(1/chunkSize);
	let xMax=Math.floor(vecMax.x+chunks.length/2);
	let yMax=Math.floor(vecMax.y+chunks[0].length/2);

	let overlap=[];
	for(let x=xMin;x<=xMax;x++){
		for(let y=yMin;y<=yMax;y++){
			if(x>=0&&x<chunks.length && y>=0&&y<chunks[x].length){
				overlap.push(chunks[x][y]);
			}
		}
	}

	return overlap;
}

function overlayColor(base,over){
	let sRGB = c0lor.space.rgb.sRGB;
	let bStr=base.replace("#","");
	let oStr=over.replace("#","");
	//let baseHSV=c0lor.RGB().hex(bStr).rgb().hsv();
	let overHSV=c0lor.RGB().hex(oStr).rgb().hsv();
	overHSV.v=Math.min(overHSV.v,0.9);
	let baseRGB=c0lor.RGB().hex(bStr).rgb();
	let overRGB=overHSV.rgb();//c0lor.RGB().hex(oStr).rgb();
	overRGB.r=overlayPart(baseRGB.r,overRGB.r);
	overRGB.g=overlayPart(baseRGB.g,overRGB.g);
	overRGB.b=overlayPart(baseRGB.b,overRGB.b);

	//return "#"+overHSV.rgb().RGB().hex();
	return "#"+overRGB.RGB().hex();
}
function overlayPart(bV,oV){
	if(bV>0.5){
		return (1-(1-2*(bV-0.5)) * (1-oV));
	}else{
		return ((2*bV) * oV);
	}
}
function hexToLab(target){
	let tStr=target.replace("#","");
	let tarCol=c0lor.RGB().hex(tStr).rgb();

	let sRGB = c0lor.space.rgb.sRGB;

	let tarXYZ = sRGB.XYZ(tarCol);

	let labD50 = c0lor.space.lab(c0lor.white.D50);
	return labD50.Lab(tarXYZ);
}
function labToHex(target){
	let labD50 = c0lor.space.lab(c0lor.white.D50);
	let tarXYZ = labD50.XYZ(target);

	let sRGB = c0lor.space.rgb.sRGB;

	let tarCol=sRGB.rgb(tarXYZ);

	limCol(tarCol);
	return "#"+ tarCol.RGB().hex();
}
function limCol(target){
	let over=Math.max(target.r,target.g,target.b);
	if(over>1){
		target.r=target.r/over;
		target.g=target.g/over;
		target.b=target.b/over;
	}
}

var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

setup();
setInterval(run, 20);
window.onresize=()=>{updateSize();}

canvas.onmousemove = (e)=>{trackMouse(e)};
var mousePos=new Vector();
var mousePosReal=new Vector();
function trackMouse(e){
	mousePosReal=new Vector(e.offsetX,e.offsetY);
}

var mouseDown = false;
canvas.onmousedown = function() { 
  mouseDown=true;
}
document.body.onmouseup = function() {
  mouseDown=false;
}