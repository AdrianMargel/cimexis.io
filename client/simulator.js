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

		let maxPoints=400;
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
		let min=0.05;
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