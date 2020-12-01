
require('./util.js')();
require('./statCalculator.js')();

class Bot{
	constructor(){

		//EDIT THE CODE BELOW:

		this.username="Bot";
		this.color="#0087E8";
		this.stats={
			weapon: "gun",
			sight: 25,
			speed: 50,
			reload: 100,
			bulletSize: 100,
			bulletSpeed: 100,
			regen: 25
		};
	}
	control(){

		//EDIT THE CODE BELOW:

		//shoot at and run towards closest player
		let closestPlayer=getClosest(getPlayerList());
		runAt(closestPlayer);
		shootAt(closestPlayer);

		//if there is no player in sight
		if(closestPlayer==null){
			//move to a position on the map
			let desiredPos=new Vector(20,20);
			//if the distance is 
			if(getDist(desiredPos)>5){
				runAt(desiredPos);
				shootFrom(desiredPos);
			}
		}
	}
	spawn(){
		//do not edit
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