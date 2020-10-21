
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

		this.time=0;
		this.moveTo=new Vector(0,0);
	}
	control(controllingPlayer,visibleState,settings){
		if(this.time%40==0){
			this.moveTo=new Vector((Math.random()*2-1)*settings.size.x,(Math.random()*2-1)*settings.size.y);
		}
		this.time++;
		let pos=new Vector(controllingPlayer.pos);
		let dist=-1;
		let closest=null;
		for(let i=0;i<visibleState.playersList.length;i++){
			if(visibleState.playersList[i].uid!=controllingPlayer.uid){
				let pPos=new Vector(visibleState.playersList[i].pos);
				let pDist=pos.getMag(pPos);
				if(dist==-1||pDist<dist){
					closest=visibleState.playersList[i];
					dist=pDist;
				}
			}
		}
		let aim=new Vector(0,0);
		if(closest!=null){
			aim=new Vector(closest.pos);
		}
		let move=new Vector(this.moveTo);
		let attack=closest!=null;
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