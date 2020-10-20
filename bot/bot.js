
require('./util.js')();
require('./statCalculator.js')();

class Bot{
	constructor(){
		this.username="Bot";
		this.color="#0087E8";
		this.stats={
			weapon: "mini gun",
			sight: 25,
			speed: 100,
			reload: 100,
			bulletSize: 100
		};

		this.selfImage=new Player(this.stats);
		console.log(this.selfImage);
	}
	control(controllingPlayer,visibleState,settings){
		let move=new Vector();
		let aim=new Vector();
		let attack=true;
		return new ControlRequest(move,aim,attack);
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