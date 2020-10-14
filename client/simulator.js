class Chunk{
	constructor(cPos){
		this.players=[];
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
}
class Player{
	constructor(username,color,stats,startPos,settings){
		this.username=username;
		this.stats=stats;
		this.stats.validate();
		this.colorDark=overlayColor("#939393",color);
		this.colorLight=overlayColor("#AFAFAF",color);

		this.pos=new Vector(startPos);
		this.velo=new Vector();
		this.rot=0;

		this.healthMax=this.stats.getHealth();
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
		this.kickback=this.stats.getKickback();
		this.accuracy=this.stats.getAccuracy();

		this.weapon=this.stats.getWeapon(settings);
		if(this.weapon.modifyStats){
			this.weapon.modifyStats(this);
		}
		this.health=this.healthMax;

		this.friction=0.8;

		this.visible=true;
		this.ghostTime=0;
	}

	repel(game){
		let hitBox=new Vector(this.size/2,this.size/2);
		let testPos=new Vector(this.pos);
		testPos.subVec(hitBox);
		hitBox.sclVec(2);
		let overlap=game.getChunks(testPos,hitBox);

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
	control(req,state){
		if(req.move){
			let newVelo=new Vector(req.move);
			newVelo.subVec(this.pos);
			newVelo.limVec(this.speed);
			this.velo.addVec(newVelo);
		}
		let ang=this.pos.getAng(req.aim);
		this.rot=ang;
		if(req.attack&&this.reloadWait<=0&&this.ghostTime==0){
			let aim=new Vector(req.aim);
			this.weapon.shoot(this,aim,state.bulletsList);
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
	move(mapSize){
		this.ghostTime=Math.max(this.ghostTime-1, 0);
		this.reloadWait=Math.max(this.reloadWait-this.reload, 0);
		this.health=Math.min(this.health+this.regen, this.healthMax);
		this.pos.addVec(this.velo);
		this.velo.sclVec(this.friction);
		let negSize=new Vector(mapSize);
		negSize.sclVec(-1);
		this.pos.minVec(mapSize);
		this.pos.maxVec(negSize);
		if(this.weapon.move){
			this.weapon.move(this);
		}
		if(this.reloadWait==0){
			if(this.weapon.charge){
				this.weapon.charge(this.reload);
			}
		}
	}
	write(game){
		let hitBox=new Vector(this.size/2,this.size/2);
		let testPos=new Vector(this.pos);
		testPos.subVec(hitBox);
		hitBox.sclVec(2);
		let overlap=game.getChunks(testPos,hitBox);

		let players=[];
		for(let i=0;i<overlap.length;i++){
			overlap[i].write(this);
		}
	}
	hit(damage,hitter){
		if(this.ghostTime<=0){
			this.health=Math.min(Math.max(this.health-damage,0),this.healthMax);
		}
	}
	kill(){
		this.health=0;
	}
	isDead(){
		return this.health<=0;
	}
	getHealthPercent(){
		return this.health/this.healthMax;
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
	//int accuracy

	//string weapon
	constructor(){
		this.health=25;
		this.regen=25;
		this.speed=25;
		this.size=25;
		this.sight=25;

		this.meleeDamage=25;

		this.reload=25;
		this.damage=25;
		//this.range=100;
		this.bulletSpeed=25;
		this.bulletSize=25;
		this.knockback=25;
		this.kickback=25;
		this.accuracy=25;

		this.weapon=gunList[0].name;

		this.validate();
	}

	validate(){
		this.health=Math.max(Math.min(this.health,100),0);
		this.regen=Math.max(Math.min(this.regen,100),0);
		this.speed=Math.max(Math.min(this.speed,100),0);
		this.size=Math.max(Math.min(this.size,100),0);
		this.sight=Math.max(Math.min(this.sight,100),0);
		this.meleeDamage=Math.max(Math.min(this.meleeDamage,100),0);
		this.reload=Math.max(Math.min(this.reload,100),0);
		this.damage=Math.max(Math.min(this.damage,100),0);
		//this.range=Math.max(Math.min(this.range,100),0);
		this.bulletSpeed=Math.max(Math.min(this.bulletSpeed,100),0);
		this.bulletSize=Math.max(Math.min(this.bulletSize,100),0);
		this.knockback=Math.max(Math.min(this.knockback,100),0);
		this.kickback=Math.max(Math.min(this.kickback,100),0);
		this.accuracy=Math.max(Math.min(this.accuracy,100),0);

		let total=
			this.health+
			this.regen+
			this.speed+
			this.size+
			this.sight+
			this.meleeDamage+
			this.reload+
			this.damage+
			//this.range+
			this.bulletSpeed+
			this.bulletSize+
			this.knockback+
			this.kickback+
			this.accuracy;

		let maxPoints=300;
		if(total>maxPoints){
			let scaling=maxPoints/total;
			this.health*=scaling;
			this.regen*=scaling;
			this.speed*=scaling;
			this.size*=scaling;
			this.sight*=scaling;
			this.meleeDamage*=scaling;
			this.reload*=scaling;
			this.damage*=scaling;
			//this.range*=scaling;
			this.bulletSpeed*=scaling;
			this.bulletSize*=scaling;
			this.knockback*=scaling;
			this.kickback*=scaling;
			this.accuracy*=scaling;
		}
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
		let min=3;
		let max=15;
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
		let max=0.8;
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
	getKickback(){
		let val=this.kickback/100;
		let min=0.05;
		let max=0.2;
		return val*(max-min)+min;
	}
	getAccuracy(){
		let val=this.accuracy/100;
		let min=0.15;
		let max=0;
		return val*(max-min)+min;
	}

	getWeapon(settings){
		return settings.getWeapon(this.weapon);
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

class GameState{
	constructor(){
		this.playersList=[];
		this.bulletsList=[];
	}
	getVisiblePlayers(target){
		let sight=target.sight;
		let visP=[];
		for(let i=0;i<this.playersList.length;i++){
			if(this.canSee(sight,target.pos,this.playersList[i].size,this.playersList[i].pos)){
				visP.push(this.playersList[i]);
			}
		}
		return visP;
	}
	getVisibleBullets(target){
		let sight=target.sight;
		let visB=[];
		for(let i=0;i<this.bulletsList.length;i++){
			if(this.canSee(sight,target.pos,this.bulletsList[i].size,this.bulletsList[i].pos)){
				visB.push(this.bulletsList[i]);
			}
		}
		return visB;
	}
	canSee(sight,pos,size,tar){
		return pos.getMag(tar)<sight/2+size/2;
	}
}
class Settings{
	constructor(){
		this.size=new Vector(100,100);
		this.chunkSize=5;
		this.weaponsList=gunList;
	}
	getWeapon(name){
		for(let i=0;i<this.weaponsList.length;i++){
			if(this.weaponsList[i].name==name){
				return this.weaponsList[i].clone();
			}
		}
		return this.weaponsList[0].clone();
	}
}
class Game{
	constructor(){
		this.chunks=[];
		this.settings=new Settings();
		this.state=new GameState();
		this.requestQueue=[];
	}
	setup(){
		let chunkDims=new Vector(this.settings.size);
		chunkDims.sclVec(1/this.settings.chunkSize);
		console.log(chunkDims);
		for(let x=-chunkDims.x;x<chunkDims.x;x++){
			let chunkCol=[];
			for(let y=-chunkDims.y;y<chunkDims.y;y++){
				let toAdd=new Chunk(new Vector(x,y));
				chunkCol.push(toAdd);
			}
			this.chunks.push(chunkCol);
		}

		this.spawn(new Player("Franklin","#16A326",new Stats(),new Vector(Math.random()*200-100,Math.random()*200-100), this.settings));
		for(let i=0;i<20;i++){
			this.spawn(new Player("username","#E51616",new Stats(),new Vector(Math.random()*200-100,Math.random()*200-100), this.settings));
		}
	}
	run(){
		for(let x=0;x<this.chunks.length;x++){
			for(let y=0;y<this.chunks[x].length;y++){
				this.chunks[x][y].prime();
			}
		}
		for(let i=0;i<this.state.playersList.length;i++){
			this.state.playersList[i].move(this.settings.size);
			this.state.playersList[i].write(this);
		}
		for(let i=0;i<this.state.playersList.length;i++){
			this.state.playersList[i].repel(this);
		}
		for(let i=0;i<this.state.bulletsList.length;i++){
			if(this.state.bulletsList[i].velo.getMag()>this.state.bulletsList[i].size){
				this.state.bulletsList[i].move(0.5,this.settings.size);
				this.state.bulletsList[i].hit(this);
				this.state.bulletsList[i].move(0.5,this.settings.size);
				this.state.bulletsList[i].hit(this);
			}else{
				this.state.bulletsList[i].move(1,this.settings.size);
				this.state.bulletsList[i].hit(this);
			}
		}

		//remove dead
		for(let i=this.state.playersList.length-1;i>=0;i--){
			if(this.state.playersList[i].isDead()){
				this.state.playersList.splice(i,1);
			}
		}
		for(let i=this.state.bulletsList.length-1;i>=0;i--){
			if(this.state.bulletsList[i].isDead()){
				this.state.bulletsList.splice(i,1);
			}
		}
	}

	spawn(toAdd){
		//toAdd.pos=new Vector(Math.random()*this.settings.size*2-this.settings.size,Math.random()*this.settings.size*2-this.settings.size);
		toAdd.ghostTime=90;
		this.state.playersList.push(toAdd);
	}

	getViewState(player){
		let visState=new GameState();
		visState.playersList=this.state.getVisiblePlayers(player);
		visState.bulletsList=this.state.getVisibleBullets(player);
		return visState;
	}

	getChunks(vec,tarSize){
		let vecMin=new Vector(vec);
		let vecMax=new Vector(vec);
		vecMax.addVec(tarSize);

		vecMin.sclVec(1/this.settings.chunkSize);
		let xMin=Math.floor(vecMin.x+this.chunks.length/2);
		let yMin=Math.floor(vecMin.y+this.chunks[0].length/2);

		vecMax.sclVec(1/this.settings.chunkSize);
		let xMax=Math.floor(vecMax.x+this.chunks.length/2);
		let yMax=Math.floor(vecMax.y+this.chunks[0].length/2);

		let overlap=[];
		for(let x=xMin;x<=xMax;x++){
			for(let y=yMin;y<=yMax;y++){
				if(x>=0&&x<this.chunks.length && y>=0&&y<this.chunks[x].length){
					overlap.push(this.chunks[x][y]);
				}
			}
		}

		return overlap;
	}
}