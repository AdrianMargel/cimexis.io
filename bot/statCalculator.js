class Player{
	constructor(stats){
		this.stats=new Stats(stats);
		this.stats.validate();

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
		this.weapon=this.getWeapon();
		if(this.weapon.modifyStats){
			this.weapon.modifyStats(this);
		}
		this.health=this.healthMax;
		this.friction=0.8;
	}
	getWeapon(){
		for(let i=0;i<gunList.length;i++){
			if(gunList[i].name==name){
				return gunList[i].clone();
			}
		}
		return gunList[0].clone();
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
	constructor(clone){
		this.health=clone.health;
		this.regen=clone.regen;
		this.speed=clone.speed;
		this.size=clone.size;
		this.sight=clone.sight;

		this.meleeDamage=clone.meleeDamage;

		this.reload=clone.reload;
		this.damage=clone.damage;
		//this.range=100;
		this.bulletSpeed=clone.bulletSpeed;
		this.bulletSize=clone.bulletSize;
		this.knockback=clone.knockback;
		this.kickback=clone.kickback;
		this.accuracy=clone.accuracy;

		this.weapon=clone.weapon;

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

class Gun{
	constructor(){
		this.name="gun";
	}
	clone(){
		return new Gun();
	}
}

class Sniper extends Gun{
	constructor(){
		super();
		this.name="sniper";
	}
	modifyStats(shooter){
		//(keep in mind that it is harder to aim as accuracy increased)
		shooter.accuracy*=0.4;
		shooter.reload*=0.25;
		shooter.damage*=3;
		shooter.bulletSpeed*=1.5;
		shooter.sight*=1.2;
		shooter.range*=1.2;
		shooter.kickback*=4;
	}
	clone(){
		return new Sniper();
	}
}

class ShotGun extends Gun{
	constructor(){
		super();
		this.name="shot gun";
	}
	modifyStats(shooter){
		//(keep in mind that it is harder to aim as accuracy increased)
		shooter.accuracy=(shooter.accuracy+0.02)*3;
		shooter.reload*=0.5;
		shooter.damage*=0.8;
		shooter.bulletSize=Math.max(shooter.bulletSize*0.75,0.6);
		shooter.range*=0.4;
		shooter.kickback*=4;
		shooter.knockback*=0.5;
	}
	clone(){
		return new ShotGun();
	}
}

class MiniGun extends Gun{
	constructor(){
		super();
		this.name="mini gun";
	}
	modifyStats(shooter){
		//(keep in mind that it is harder to aim as accuracy increased)
		shooter.accuracy=(shooter.accuracy+0.02)*2;
		shooter.reload*=3;
		shooter.bulletSize=Math.max(shooter.bulletSize*0.75,0.6);
		shooter.damage*=0.5;
		shooter.range*=0.8;
	}
	clone(){
		return new MiniGun();
	}
}

class Cannon extends Gun{
	constructor(){
		super();
		this.name="cannon";
	}
	modifyStats(shooter){
		shooter.reload*=0.2;
		shooter.bulletSize*=3;
		shooter.bulletSpeed*=0.8;
		shooter.damage*=5;
		shooter.kickback*=4;
	}
	clone(){
		return new Cannon();
	}
}

class Stealth extends Gun{
	constructor(){
		super();
		this.name="stealth";
	}
	clone(){
		return new Stealth();
	}
}

class Charger extends Gun{
	constructor(){
		super();
		this.name="charger";
	}
	modifyStats(shooter){
		shooter.reload*=1.2;
		shooter.damage*=0.8;
		shooter.bulletSize*=0.8;
	}
	clone(){
		return new Charger();
	}
}

class MineLayer extends Gun{
	constructor(){
		super();
		this.name="mine layer";
	}
	modifyStats(shooter){
		shooter.bulletSpeed=0;
		shooter.range*=10;
		shooter.damage*=2;
		shooter.kickback*=0.5;
		shooter.bulletSize*=1.5;
	}
	clone(){
		return new MineLayer();
	}
}

class Puncher extends Gun{
	constructor(){
		super();
		this.name="puncher";
	}
	modifyStats(shooter){
		shooter.range*=0.75;
		shooter.knockback*=2;
		shooter.reload*=0.8;
		shooter.kickback*=0.1;
		shooter.bulletSpeed*=0.8;
		shooter.bulletSize*=1.5;
		shooter.accuracy=(shooter.accuracy+0.01)*1.5;
	}
	clone(){
		return new Puncher();
	}
}

class Thruster extends Gun{
	constructor(){
		super();
		this.name="thruster";
	}
	modifyStats(shooter){
		//(keep in mind that it is harder to aim as accuracy increased)
		shooter.accuracy=(shooter.accuracy+0.1)*3;
		shooter.bulletSpeed*=1.4;
		shooter.range*=0.2;
		shooter.kickback*=3;
		shooter.reload*=2;
		shooter.speed=0;
		shooter.bulletSize*=1.2;
	}
	clone(){
		return new Thruster();
	}
}

class SplitShot extends Gun{
	constructor(){
		super();
		this.name="split shot";
	}
	modifyStats(shooter){
		shooter.bulletSize*=0.8;
		shooter.range*=0.8;
		shooter.kickback*=0.5;
	}
	clone(){
		return new SplitShot();
	}
}

class Spinner extends Gun{
	constructor(){
		super();
		this.name="spinner";
	}
	modifyStats(shooter){
		shooter.reload*=0.75;
	}
	clone(){
		return new Spinner();
	}
}

class Claw extends Gun{
	constructor(){
		super();
		this.name="claw";
	}
	modifyStats(shooter){
		shooter.meleeDamage*=2;
		shooter.speed*=1.4;
	}
	clone(){
		return new Claw();
	}
}

class Wall extends Gun{
	constructor(){
		super();
		this.name="wall";
	}
	modifyStats(shooter){
		shooter.healthMax*=3;
		shooter.regen*=1.1;
		shooter.speed*=0.5;
	}
	clone(){
		return new Wall();
	}
}
class Healer extends Gun{
	constructor(){
		super();
		this.name="healer";
	}
	modifyStats(shooter){
		shooter.damage*=-0.2;
	}
	clone(){
		return new Healer();
	}
}
class Unarmed extends Gun{
	constructor(){
		super();
		this.name="unarmed";
	}
	clone(){
		return new Unarmed();
	}
}

var gunList=[
	new Gun(), //default gun is at index 0
	new Sniper(),
	new ShotGun(),
	new MiniGun(),
	new Cannon(),
	new Stealth(),
	new Charger(),
	new MineLayer(),
	new Puncher(),
	new Thruster(),
	new SplitShot(),
	new Spinner(),
	new Claw(),
	new Wall(),
	new Healer(),
	new Unarmed()
];

module.exports = function() {
	this.Player=Player;
}