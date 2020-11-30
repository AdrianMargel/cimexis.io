
require('./util.js')();
require('./statCalculator.js')();

class Bot{
	constructor(){
		this.username="Bot";
		this.color="#0087E8";
		this.stats={
			weapon: "mini gun",
			sight: 25,
			speed: 50,
			reload: 100,
			bulletSize: 100,
			bulletSpeed: 100,
			regen: 25
		};

		this.selfImage=new Player(this.stats);

		this.time=0;
		this.moveTo=new Vector(0,0);
	}
	control(){
		let closestPlayer=getClosest(getPlayerList());
		runAt(closestPlayer);
		shootAt(closestPlayer);
		if(closestPlayer==null){
			let desiredPos=new Vector(20,20);
			if(getDist(desiredPos)>5){
				runAt(desiredPos);
				shootFrom(desiredPos);
			}
		}
	}
	spawn(){
		return {
			username: this.username,
			color: this.color,
			stats: this.stats
		}
	}
}

module.exports = function() {
	this.Bot=Bot;
}