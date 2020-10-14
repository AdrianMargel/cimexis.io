class Gun{
	constructor(){
		this.name="gun";
	}
	shoot(shooter, target, bulletsList){
		let bulletSpeed=shooter.bulletSpeed;
		let range=shooter.range;
		let bulletSize=shooter.bulletSize;
		let damage=shooter.damage;
		let knockback=shooter.knockback;
		let kickback=shooter.kickback;
		let accuracy=shooter.accuracy;

		let pos=new Vector(shooter.pos);
		let velo=new Vector(target);
		velo.subVec(pos);
		let ang=velo.getAng();//in case bulletSpeed is 0 get ang first
		velo.limVec(bulletSpeed);
		let mag=velo.getMag();

		pos.addVec(new Vector(ang,shooter.size/2,true));

		let kick=new Vector(ang+Math.PI,kickback,true);
		shooter.velo.addVec(kick);

		ang+=(Math.random()*2-1)*accuracy;
		velo=new Vector(ang,mag,true);

		this.shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback);
	}
	shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback){
		bulletsList.push(new Bullet(shooter,pos,velo, range,bulletSize,damage,knockback));
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
		shooter.accuracy=(shooter.accuracy+0.01)*3;
		shooter.reload*=0.5;
		shooter.damage*=0.8;
		shooter.bulletSize=Math.max(shooter.bulletSize*0.75,0.6);
		shooter.range*=0.4;
		shooter.kickback*=4;
		shooter.knockback*=0.5;
	}
	shoot(shooter, target, bulletsList){
		let bulletSpeed=shooter.bulletSpeed;
		let range=shooter.range;
		let bulletSize=shooter.bulletSize;
		let damage=shooter.damage;
		let knockback=shooter.knockback;
		let kickback=shooter.kickback;
		let accuracy=shooter.accuracy;

		let pos=new Vector(shooter.pos);
		let velo=new Vector(target);
		velo.subVec(pos);
		let ang=velo.getAng();//in case bulletSpeed is 0 get ang first
		velo.limVec(bulletSpeed);
		let mag=velo.getMag();

		pos.addVec(new Vector(ang,shooter.size/2,true));

		let kick=new Vector(ang+Math.PI,kickback,true);
		shooter.velo.addVec(kick);

		let shots=Math.random()*4+10;
		for(let i=0;i<shots;i++){
			let ang2=ang+(Math.random()*2-1)*accuracy;
			let mag2=mag*(1-Math.random()*0.4);
			let bSize=bulletSize*(1-Math.random()*0.2);
			velo=new Vector(ang2,mag2,true);

			this.shootBullet(bulletsList, shooter,pos,velo, range,bSize,damage,knockback);
		}
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
		shooter.accuracy=(shooter.accuracy+0.01)*2;
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
		this.stealthBuild=0;
	}
	move(shooter){
		if(shooter.velo.getMag()<0.1){
			if(this.stealthBuild>20){
				shooter.visible=false;
			}else{
				this.stealthBuild++;
			}
		}else{
			shooter.visible=true;
			this.stealthBuild=0;
		}
	}
	clone(){
		return new Stealth();
	}
}

class Charger extends Gun{
	constructor(){
		super();
		this.name="charger";
		this.stored=0;
	}
	modifyStats(shooter){
		shooter.reload*=1.2;
		shooter.damage*=0.8;
		shooter.bulletSize*=0.8;
	}
	shoot(shooter, target, bulletsList){
		let bulletSpeed=shooter.bulletSpeed;
		let range=shooter.range;
		let bulletSize=shooter.bulletSize;
		let damage=shooter.damage;
		let knockback=shooter.knockback;
		let kickback=shooter.kickback;
		let accuracy=shooter.accuracy;

		bulletSize*=(1+this.stored*0.5);
		damage*=(1+this.stored);
		this.stored=0;

		let pos=new Vector(shooter.pos);
		let velo=new Vector(target);
		velo.subVec(pos);
		let ang=velo.getAng();//in case bulletSpeed is 0 get ang first
		velo.limVec(bulletSpeed);
		let mag=velo.getMag();

		pos.addVec(new Vector(ang,shooter.size/2,true));

		let kick=new Vector(ang+Math.PI,kickback,true);
		shooter.velo.addVec(kick);

		ang+=(Math.random()*2-1)*accuracy;
		velo=new Vector(ang,mag,true);

		this.shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback);
	}
	charge(amount){
		this.stored=Math.min(amount*0.8+this.stored,3);
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
		shooter.range*=8;
		shooter.damage*=0.5;
		shooter.kickback*=0.5;
	}
	shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback){
		bulletsList.push(new Mine(shooter,pos,velo, range,bulletSize,damage,knockback));
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
		shooter.range*=0.2;
		shooter.knockback*=2;
		shooter.reload*=2;
		shooter.kickback*=0.1;
		shooter.bulletSpeed*=0.8;
		shooter.bulletSize*=1.5;
	}
	shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback){
		bulletsList.push(new Fist(shooter,pos,velo, range,bulletSize,damage,knockback));
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
	shoot(shooter, target, bulletsList){
		let bulletSpeed=shooter.bulletSpeed;
		let range=shooter.range;
		let bulletSize=shooter.bulletSize;
		let damage=shooter.damage;
		let knockback=shooter.knockback;
		let kickback=shooter.kickback;
		let accuracy=shooter.accuracy;

		{
			let pos=new Vector(shooter.pos);
			let velo=new Vector(target);
			velo.subVec(pos);
			let ang=velo.getAng()+Math.PI/5;//in case bulletSpeed is 0 get ang first
			velo.limVec(bulletSpeed);
			let mag=velo.getMag();
			pos.addVec(new Vector(ang,shooter.size/2,true));
			let kick=new Vector(ang+Math.PI,kickback,true);
			shooter.velo.addVec(kick);
			ang+=(Math.random()*2-1)*accuracy;
			velo=new Vector(ang,mag,true);
			this.shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback);
		}
		{
			let pos=new Vector(shooter.pos);
			let velo=new Vector(target);
			velo.subVec(pos);
			let ang=velo.getAng()-Math.PI/5;//in case bulletSpeed is 0 get ang first
			velo.limVec(bulletSpeed);
			let mag=velo.getMag();
			pos.addVec(new Vector(ang,shooter.size/2,true));
			let kick=new Vector(ang+Math.PI,kickback,true);
			shooter.velo.addVec(kick);
			ang+=(Math.random()*2-1)*accuracy;
			velo=new Vector(ang,mag,true);
			this.shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback);
		}
	}
	clone(){
		return new SplitShot();
	}
}

class Spinner extends Gun{
	constructor(){
		super();
		this.name="spinner";
		this.rot1=Math.PI/3;
		this.rot2=0;
	}
	modifyStats(shooter){
		shooter.reload*=0.75;
	}
	move(){
		this.rot1+=0.1;
		this.rot2-=0.03;
	}
	shoot(shooter, target, bulletsList){
		let bulletSpeed=shooter.bulletSpeed;
		let range=shooter.range;
		let bulletSize=shooter.bulletSize;
		let damage=shooter.damage;
		let knockback=shooter.knockback;
		let kickback=shooter.kickback;
		let accuracy=shooter.accuracy;

		{
			let pos=new Vector(shooter.pos);
			let ang=this.rot1;
			let mag=bulletSpeed;
			let velo=new Vector(ang,mag,true);
			pos.addVec(new Vector(ang,shooter.size/2,true));
			ang+=(Math.random()*2-1)*accuracy;
			velo=new Vector(ang,mag,true);
			this.shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback);
		}
		{
			let pos=new Vector(shooter.pos);
			let ang=this.rot1+Math.PI;
			let mag=bulletSpeed;
			let velo=new Vector(ang,mag,true);
			pos.addVec(new Vector(ang,shooter.size/2,true));
			ang+=(Math.random()*2-1)*accuracy;
			velo=new Vector(ang,mag,true);
			this.shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback);
		}
		{
			let pos=new Vector(shooter.pos);
			let ang=this.rot2;
			let mag=bulletSpeed;
			let velo=new Vector(ang,mag,true);
			pos.addVec(new Vector(ang,shooter.size/2,true));
			ang+=(Math.random()*2-1)*accuracy;
			velo=new Vector(ang,mag,true);
			this.shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback);
		}
		{
			let pos=new Vector(shooter.pos);
			let ang=this.rot2+Math.PI;
			let mag=bulletSpeed;
			let velo=new Vector(ang,mag,true);
			pos.addVec(new Vector(ang,shooter.size/2,true));
			ang+=(Math.random()*2-1)*accuracy;
			velo=new Vector(ang,mag,true);
			this.shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback);
		}
	}
	clone(){
		return new Spinner();
	}
}

class Claw extends Gun{
	constructor(){
		super();
		this.name="claw";
		this.rot=0;
	}
	modifyStats(shooter){
		shooter.meleeDamage*=4;
		shooter.speed*=1.4;
	}
	move(){
		this.rot+=0.01;
	}
	shoot(shooter, target, bulletsList){

	}
	clone(){
		return new Claw();
	}
}

class Wall extends Gun{
	constructor(){
		super();
		this.name="wall";
		this.rot=0;
	}
	modifyStats(shooter){
		shooter.healthMax*=3;
		shooter.regen*=1.1;
		shooter.speed*=0.5;
	}
	move(){
		this.rot+=0.01;
	}
	shoot(shooter, target, bulletsList){

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
	shootBullet(bulletsList, shooter,pos,velo, range,bulletSize,damage,knockback){
		bulletsList.push(new HealOrb(shooter,pos,velo, range,bulletSize,damage,knockback));
	}
	clone(){
		return new Healer();
	}
}
class Unarmed extends Gun{
	constructor(){
		super();
		this.name="unarmed";
		this.timeUp=0;
		this.time=0;
		this.surrenderSpeed=1;
		this.surrenderSize=1;
	}
	move(){
		this.time+=this.surrenderSpeed;
		if(this.timeUp>0){
			this.timeUp--;
		}
	}
	shoot(shooter, target, bulletsList){
		this.surrenderSpeed=shooter.bulletSpeed/5;
		this.surrenderSize=Math.PI/4*shooter.bulletSize;
		this.timeUp=30;
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

class Bullet{
	constructor(shooter,pos,velo,life,size,damage,knockback){
		this.shooter=shooter;
		this.pos=new Vector(pos);
		this.velo=new Vector(velo);

		this.life=life;
		this.size=size;
		this.damage=damage;
		this.knockback=knockback;

		this.colorDark=shooter.colorDark;
		this.colorLight=shooter.colorLight;

		this.name="bullet";
	}

	move(time,mapSize){
		let moveVec=new Vector(this.velo);
		moveVec.sclVec(time);
		this.pos.addVec(moveVec);

		let negSize=new Vector(mapSize);
		negSize.sclVec(-1);
		if(this.pos.x<negSize.x||this.pos.x>mapSize.x){
			this.velo.x*=-0.8;
		}
		if(this.pos.y<negSize.y||this.pos.y>mapSize.y){
			this.velo.y*=-0.8;
		}
		this.pos.minVec(mapSize);
		this.pos.maxVec(negSize);

		this.life=Math.max(this.life-1*time,0);
	}
	hit(game){
		if(!this.isDead()){
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
}
class Mine extends Bullet{
	constructor(shooter,pos,velo,life,size,damage,knockback){
		super(shooter,pos,velo,life,size,damage,knockback);
		this.name="mine";
		this.ang=Math.random()*Math.PI*2;
	}
	move(time,mapSize){
		super.move(time,mapSize);
		this.ang-=0.01;
	}
}
class Fist extends Bullet{
	constructor(shooter,pos,velo,life,size,damage,knockback){
		super(shooter,pos,velo,life,size,damage,knockback);
		this.name="fist";
		this.ang=this.velo.getAng();
	}

	move(time,mapSize){
		super.move(time,mapSize);
		this.ang=this.velo.getAng();
	}
}
class HealOrb extends Bullet{
	constructor(shooter,pos,velo,life,size,damage,knockback){
		super(shooter,pos,velo,life,size,damage,knockback);
		this.name="heal";
		this.ang=Math.random()*Math.PI*2;
	}
	move(time,mapSize){
		super.move(time,mapSize);
		this.ang-=0.04;
	}

}