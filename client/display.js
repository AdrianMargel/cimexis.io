class Camera{
	constructor(){
		this.pos=new Vector(0,0);
		this.zoom=10;
	}
}

//call newState to figure out how far everything needs to move/how fast
//call predict to animate this path 
class Display{
	constructor(){
		this.cam=new Camera();
		this.canvas=document.getElementById("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.canvasContainer=document.getElementById("canvasContainer");

		this.mapCanvas=document.getElementById("mapCanvas");
		this.mapCtx = this.mapCanvas.getContext("2d");

		this.canvasSize=new Vector(1200,1200);
		this.following=null;
		this.mapCanvasSize=new Vector(200,200);
		this.updateSize();
		this.phantomState=null;
		this.state=null;
	}
	connect(){
		window.onresize=()=>{this.updateSize();}
	}

	newState(state){
		let rewind=3;
		this.state=state;
		if(this.phantomState==null){
			this.phantomState=clone(this.state);
			for(let j=0;j<this.phantomState.bulletsList.length;j++){
				this.phantomState.bulletsList[j].pos=new Vector(this.phantomState.bulletsList[j].pos);
			}
			for(let j=0;j<this.phantomState.playersList.length;j++){
				this.phantomState.playersList[j].pos=new Vector(this.phantomState.playersList[j].pos);
			}
		}
		for(let j=0;j<this.phantomState.bulletsList.length;j++){
			this.phantomState.bulletsList[j].deadTime++;
		}
		for(let i=0;i<state.bulletsList.length;i++){
			let matched=null;
			for(let j=0;j<this.phantomState.bulletsList.length;j++){
				if(this.phantomState.bulletsList[j].uid==state.bulletsList[i].uid){
					matched=this.phantomState.bulletsList[j];
					matched.deadTime=0;
					break;
				}
			}
			if(matched==null){
				matched=clone(state.bulletsList[i]);
				matched.deadTime=0;
				matched.pos=new Vector(matched.pos);
				let reverse=new Vector(matched.velo);
				reverse.sclVec(rewind);
				matched.pos.subVec(reverse);
				this.phantomState.bulletsList.push(matched);
			}
			let movement=new Vector(state.bulletsList[i].pos);
			movement.subVec(matched.pos);
			matched.animation=movement;
			matched.velo=new Vector(state.bulletsList[i].velo);
		}
		for(let j=this.phantomState.bulletsList.length-1;j>=0;j--){
			if(this.phantomState.bulletsList[j].deadTime>1){
				this.phantomState.bulletsList.splice(j,1);
			}
		}

		for(let j=0;j<this.phantomState.playersList.length;j++){
			this.phantomState.playersList[j].deadTime++;
		}
		for(let i=0;i<state.playersList.length;i++){
			let matched=null;
			for(let j=0;j<this.phantomState.playersList.length;j++){
				if(this.phantomState.playersList[j].uid==state.playersList[i].uid){
					matched=this.phantomState.playersList[j];
					matched.deadTime=0;
					break;
				}
			}
			if(matched==null){
				matched=clone(state.playersList[i]);
				matched.deadTime=0;
				matched.pos=new Vector(matched.pos);
				let reverse=new Vector(matched.velo);
				reverse.sclVec(rewind);
				matched.pos.subVec(reverse);
				this.phantomState.playersList.push(matched);
			}
			let movement=new Vector(state.playersList[i].pos);
			movement.subVec(matched.pos);
			matched.animation=movement;
			matched.velo=new Vector(state.playersList[i].velo);
			matched.health=state.playersList[i].health;
			matched.rotAnim=nrm2Ang(state.playersList[i].rot-matched.rot);
			matched.transparent=state.playersList[i].transparent;
			if(state.playersList[i].weapon.rot!=null){
				matched.weapon.rotAnim=nrm2Ang(state.playersList[i].weapon.rot-matched.weapon.rot);
			}
			if(state.playersList[i].weapon.rot1!=null){
				matched.weapon.rot1Anim=nrm2Ang(state.playersList[i].weapon.rot1-matched.weapon.rot1);
			}
			if(state.playersList[i].weapon.rot2!=null){
				matched.weapon.rot2Anim=nrm2Ang(state.playersList[i].weapon.rot2-matched.weapon.rot2);
			}
			if(state.playersList[i].weapon.stored!=null){
				matched.weapon.storedAnim=state.playersList[i].weapon.stored-matched.weapon.stored;
			}
			if(state.playersList[i].weapon.timeUp!=null){
				matched.weapon.timeUp=state.playersList[i].weapon.timeUp;
			}
			if(state.playersList[i].weapon.time!=null){
				matched.weapon.timeAnim=state.playersList[i].weapon.time-matched.weapon.time;
			}
			if(state.playersList[i].weapon.surrenderSize!=null){
				matched.weapon.surrenderSize=state.playersList[i].weapon.surrenderSize;
			}
		}
		for(let j=this.phantomState.playersList.length-1;j>=0;j--){
			if(this.phantomState.playersList[j].deadTime>1){
				this.phantomState.playersList.splice(j,1);
			}
		}
	}
	predict(amount){
		if(this.phantomState==null){
			return;
		}
		for(let i=0;i<this.phantomState.bulletsList.length;i++){
			let toMove=new Vector(this.phantomState.bulletsList[i].animation);
			toMove.sclVec(amount);
			this.phantomState.bulletsList[i].pos.addVec(toMove);
			if(this.phantomState.bulletsList[i].ang==null){
				this.phantomState.bulletsList[i].ang=0;
			}
			if(this.phantomState.bulletsList[i].name=="mine"){
				this.phantomState.bulletsList[i].ang-=0.1*amount;
			}else if(this.phantomState.bulletsList[i].name=="heal"){
				this.phantomState.bulletsList[i].ang-=0.4*amount;
			}else if(this.phantomState.bulletsList[i].name=="fist"){
				let veloVec=new Vector(this.phantomState.bulletsList[i].velo);
				this.phantomState.bulletsList[i].ang=veloVec.getAng();
			}
		}
		for(let i=0;i<this.phantomState.playersList.length;i++){
			let toMove=new Vector(this.phantomState.playersList[i].animation);
			toMove.sclVec(amount);
			this.phantomState.playersList[i].pos.addVec(toMove);
			this.phantomState.playersList[i].rot+=this.phantomState.playersList[i].rotAnim*amount;
			
			let weapon=this.phantomState.playersList[i].weapon;
			if(weapon.rotAnim!=null){
				weapon.rot+=weapon.rotAnim*amount;
			}
			if(weapon.rot1Anim!=null){
				weapon.rot1+=weapon.rot1Anim*amount;
			}
			if(weapon.rot2Anim!=null){
				weapon.rot2+=weapon.rot2Anim*amount;
			}
			if(weapon.storedAnim!=null){
				weapon.stored+=weapon.storedAnim*amount;
				weapon.stored=Math.max(weapon.stored,0);
			}
			if(weapon.timeAnim!=null){
				weapon.time+=weapon.timeAnim*amount;
			}
		}
	}

	setFollow(playerUid){
		if(this.phantomState==null){
			return;
		}
		for(let j=0;j<this.phantomState.playersList.length;j++){
			if(this.phantomState.playersList[j].uid==playerUid){
				this.following=this.phantomState.playersList[j];
				break;
			}
		}
	}

	displayHollow(){
		this.cam.zoom = 20;
		this.cam.pos=new Vector(2.5,1);
		this.displayMap(new Vector(200,200),5);
	}
	display(settings,anim){
		if(this.phantomState==null){
			return;
		}
		let gameState=this.phantomState;
		this.predict(anim);
		this.calcCam();
		this.displayMap(settings.size,settings.chunkSize);
		if(this.following==null){
			for(let i=0;i<gameState.bulletsList.length;i++){
				this.displayBullet(gameState.bulletsList[i]);
			}
			for(let i=0;i<gameState.playersList.length;i++){
				this.displayPlayer(gameState.playersList[i]);
			}
		}else{
			let bullets=gameState.bulletsList;
			for(let i=0;i<bullets.length;i++){
				this.displayBullet(bullets[i]);
			}
			let players=gameState.playersList;
			for(let i=0;i<players.length;i++){
				this.displayPlayer(players[i]);
			}
			if(this.following!=null){
				this.displaySight(this.following);
			}
		}
	}
	updateSize(){
		let w=this.canvasContainer.offsetWidth;
		let h=this.canvasContainer.offsetHeight;
		this.canvasSize=new Vector(w,h);
		this.canvas.setAttribute("width",w);
		this.canvas.setAttribute("height",h);
	}
	calcCam(){
		if(this.following!=null){
			this.cam.zoom = Math.max(this.canvasSize.x,this.canvasSize.y)/(this.following.sight+5);
			this.cam.zoom = Math.max(this.cam.zoom,0.01); //make sure the zoom doesn't end up as 0
			this.cam.pos=new Vector(this.following.pos);
			let offset=new Vector(this.canvasSize);
			offset.sclVec(0.5);
			offset.sclVec(1/this.cam.zoom);
			this.cam.pos.subVec(offset);
		}
	}
	displayPlayer(player){
		if(player.transparent){
			this.ctx.globalAlpha=0.4;
		}
		this.ctx.font = "700 "+1*this.cam.zoom+"px Nunito";
		this.ctx.textAlign = "center";
		this.ctx.fillStyle= "#6D6862";
		this.ctx.fillText(player.username, (player.pos.x-this.cam.pos.x)*this.cam.zoom, (player.pos.y+player.size/2+1.1-this.cam.pos.y)*this.cam.zoom); 

		let healthBarY=player.size/2+1.6;
		let healthBarWide=1.5*this.getHealthPercent(player);
		this.ctx.lineWidth = 0.25*this.cam.zoom;
		this.ctx.beginPath();
		this.ctx.moveTo((player.pos.x-this.cam.pos.x-healthBarWide)*this.cam.zoom, (player.pos.y+healthBarY-this.cam.pos.y)*this.cam.zoom);
		this.ctx.lineTo((player.pos.x-this.cam.pos.x+healthBarWide)*this.cam.zoom, (player.pos.y+healthBarY-this.cam.pos.y)*this.cam.zoom);
		this.ctx.fill();

		let barChange=Math.min(Math.max((this.getHealthPercent(player)-0.3)*2,0),1);
		let barCol=HSVtoRGB(0.4*barChange, 0.9, 0.8);
		this.ctx.strokeStyle=rgbToHex(barCol.r,barCol.g,barCol.b);
		this.ctx.stroke();

		this.ctx.translate((player.pos.x-this.cam.pos.x)*this.cam.zoom, (player.pos.y-this.cam.pos.y)*this.cam.zoom);
		this.ctx.rotate(player.rot);
		this.displayGun(player.weapon,player);
		this.ctx.resetTransform();

		this.ctx.strokeStyle = player.colorDark;
		this.ctx.fillStyle= player.colorLight;
		this.ctx.beginPath();
		this.ctx.arc((player.pos.x-this.cam.pos.x)*this.cam.zoom, (player.pos.y-this.cam.pos.y)*this.cam.zoom, player.size/2*this.cam.zoom, 0, 2 * Math.PI);
		this.ctx.fill();
		this.ctx.stroke();

		this.ctx.globalAlpha=1;
	}
	getHealthPercent(player){
		return player.health/player.healthMax;
	}
	displaySight(player){
		let strokeWeight=0.2;
		this.ctx.lineWidth = strokeWeight*this.cam.zoom;
		this.ctx.setLineDash([25, 25]);
		this.ctx.strokeStyle="#B5A78B";

		this.ctx.beginPath();
		this.ctx.arc((player.pos.x-this.cam.pos.x)*this.cam.zoom, (player.pos.y-this.cam.pos.y)*this.cam.zoom, player.sight/2*this.cam.zoom, 0, 2 * Math.PI);
		this.ctx.stroke();

		// this.ctx.lineWidth = 0.2*zoom;
		// this.ctx.beginPath();
		// this.ctx.moveTo((this.pos.x-cam.pos.x)*zoom, (this.pos.y-cam.pos.y)*zoom);
		// this.ctx.lineTo((this.pos.x-cam.pos.x+this.sight/2)*zoom, (this.pos.y-cam.pos.y)*zoom);
		// this.ctx.stroke();
		this.ctx.setLineDash([]);

		let maskCanvas = document.createElement('canvas');
		maskCanvas.width = canvas.width;
		maskCanvas.height = canvas.height;
		let maskCtx = maskCanvas.getContext('2d');
		maskCtx.fillStyle = "#EFE9D7";
		maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
		maskCtx.globalCompositeOperation = 'xor';
		maskCtx.arc((player.pos.x-this.cam.pos.x)*this.cam.zoom, (player.pos.y-this.cam.pos.y)*this.cam.zoom, (player.sight/2+strokeWeight/2)*this.cam.zoom, 0, 2 * Math.PI);
		maskCtx.fill();
	    this.ctx.globalAlpha = 0.4;
		this.ctx.drawImage(maskCanvas, 0, 0);
		this.ctx.globalAlpha = 1;
	}
	displayGun(gun,player){
		this.ctx.lineWidth = 0.2*this.cam.zoom;
		this.ctx.strokeStyle="#939393";
		this.ctx.fillStyle="#AFAFAF";
		//this.ctx.lineCap="round";
		if(gun.name=="gun"){
			this.rectMid((player.size/2-1),1.8,1);
		}else if(gun.name=="sniper"){
			this.rectMid((player.size/2-1),2.8,0.8);
		}else if(gun.name=="shot gun"){
			this.rect((player.size/2-1),0,2.7,0.5);
			this.rect((player.size/2-1),0,2.7,-0.5);
			this.rectMid((player.size/2-1),2.2,1.2);
		}else if(gun.name=="mini gun"){
			this.rect((player.size/2-1),0.2,2.3,0.4);
			this.rect((player.size/2-1),-0.2,2.3,-0.4);
			this.rectMid((player.size/2-1),2.5,0.4);
		}else if(gun.name=="cannon"){
			this.start();
			this.mt((player.size/2-1),0);
			this.lt((player.size/2+0.5),-1);
			this.lt((player.size/2+0.5),1);
			this.shape();
		}else if(gun.name=="stealth"){
			this.rectMid((player.size/2-1.4),1.8,0.8);

			this.start();
			this.mt((player.size/2-1),0.25);
			this.lt((player.size/2-1),0.8);
			this.lt((player.size/2+0.5),0.8);
			this.lt((player.size/2+0.5+0.4),0.25);
			this.shape();

			this.start();
			this.mt((player.size/2-1),-0.25);
			this.lt((player.size/2-1),-0.8);
			this.lt((player.size/2+0.5),-0.8);
			this.lt((player.size/2+0.5+0.4),-0.25);
			this.shape();

		}else if(gun.name=="charger"){
			let chargeOff=gun.stored/3*0.5;
			this.start();
			this.mt((player.size/2+0.8)+chargeOff,0.4);
			this.lt((player.size/2+0.8)+chargeOff,-0.4);
			this.lt((player.size/2)+chargeOff,-0.8);
			this.lt((player.size/2)+chargeOff,0.8);
			this.shape();
			this.rectMid((player.size/2-1),1.3+chargeOff,1.8);
		}else if(gun.name=="mine layer"){
			let offX=player.size/2;
			let offY=0.8;
			this.start();
			this.mt(offX+1,offY);
			this.lt(offX,offY+-0.8);
			this.lt(offX-1,offY);
			this.lt(offX,offY+0.8);
			this.shape();

			offX=player.size/2;
			offY=-0.8;
			this.start();
			this.mt(offX+1,offY);
			this.lt(offX,offY+-0.8);
			this.lt(offX-1,offY);
			this.lt(offX,offY+0.8);
			this.shape();

			this.rectMid(player.size/2-1,1.5,0.8);
		}else if(gun.name=="puncher"){
			this.rectMid(player.size/2-1,1.9,1.6);
			this.rectMid(player.size/2-1,1.5,1.6);

		}else if(gun.name=="thruster"){
			let offX=player.size/2-1.6;
			let offY=0;
			this.start();
			this.mt(3+offX,1.2+offY);
			this.ctx.arcTo(offX*this.cam.zoom,offY*this.cam.zoom,(3+offX)*this.cam.zoom,(-1.2+offY)*this.cam.zoom,0.8*this.cam.zoom);
			this.lt(3+offX,-1.2+offY);
			this.shape();
			for(let i=1;i>0.6;i-=0.12){
				if(i==1){continue}
				this.ctx.beginPath();
				this.mt(3*i+offX,-1.2*i+offY);
				this.lt(3*i+offX,1.2*i+offY)
				this.ctx.closePath();
				this.ctx.stroke();
			}
		}else if(gun.name=="split shot"){
			let angOff=Math.PI/5;
			let offX=player.size/2;
			let offY=0;
			let path=[new Vector(0,0.3),new Vector(0.8,0.3),new Vector(0.8,-0.3),new Vector(0,-0.3)];
			this.start();
			for(let i=0;i<path.length;i++){
				let vec=new Vector(path[i]);
				vec.x+=offX;
				vec.y+=offY;
				vec.rotVec(angOff);
				if(i==0){
					this.mt(vec.x,vec.y);
				}else{
					this.lt(vec.x,vec.y);
				}
			}
			this.shape();
			this.start();
			for(let i=0;i<path.length;i++){
				let vec=new Vector(path[i]);
				vec.x+=offX;
				vec.y+=offY;
				vec.rotVec(-angOff);
				if(i==0){
					this.mt(vec.x,vec.y);
				}else{
					this.lt(vec.x,vec.y);
				}
			}
			this.shape();
		}else if(gun.name=="healer"){
			this.rectMid((player.size/2-1),2.15,0.6);
			this.rectMid((player.size/2-1),1.8,1.2);

			this.ctx.beginPath();
			this.mt((player.size/2-1),0);
			this.lt((player.size/2+0.8),0)
			this.ctx.closePath();
			this.ctx.stroke();

			this.ctx.beginPath();
			this.mt((player.size/2+0.4),0.3);
			this.lt((player.size/2+0.4),-0.3)
			this.ctx.closePath();
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.arc(-(player.size/2-0.2)*this.cam.zoom, 0, 0.6*this.cam.zoom, 0, Math.PI*2);
			this.shape();
		}else if(gun.name=="spinner"){
			this.ctx.rotate(-player.rot);
			this.ctx.rotate(gun.rot1);
				this.rectMid(-(player.size/2+1),player.size+2,0.8);
			this.ctx.rotate(-gun.rot1);
			this.ctx.rotate(gun.rot2);
				this.rectMid(-(player.size/2+1),player.size+2,0.8);
			this.ctx.rotate(-gun.rot2);
			this.ctx.rotate(player.rot);
		}else if(gun.name=="claw"){
			this.ctx.rotate(-player.rot);
			this.ctx.rotate(gun.rot);
				let offX=player.size/2;
				let offY=0;
				let path=[new Vector(-1,0.7),new Vector(0.5,0.9),new Vector(0.9,0.6),new Vector(0.5,0.3),new Vector(0.9,0),new Vector(0.5,-0.3),new Vector(0.9,-0.6),new Vector(0.5,-0.9),new Vector(-1,-0.7)];
				
				for(let a=0;a<3;a++){
					let angOff=2*Math.PI/3*a;
					this.start();
					for(let i=0;i<path.length;i++){
						let vec=new Vector(path[i]);
						vec.x+=offX;
						vec.y+=offY;
						vec.rotVec(angOff);
						if(i==0){
							this.mt(vec.x,vec.y);
						}else{
							this.lt(vec.x,vec.y);
						}
					}
					this.shape();
				}
			this.ctx.rotate(-gun.rot);
			this.ctx.rotate(player.rot);

		}else if(gun.name=="wall"){
			this.ctx.rotate(-player.rot);
			this.ctx.rotate(gun.rot);
				for(let a=0;a<4;a++){
					let angOff=2*Math.PI/4*a;
					this.ctx.rotate(angOff);
					this.ctx.beginPath();
					this.ctx.arc(0, 0, (player.size/2+0.5)*this.cam.zoom, 2.6, Math.PI*2-2.6);
					this.lt(0,-0.3);
					this.lt(0,0.3);
					let end=new Vector(2.6,(player.size/2+0.5),true);
					this.lt(end.x,end.y);
					this.shape();
					this.ctx.rotate(-angOff);
				}
			this.ctx.rotate(-gun.rot);
			this.ctx.rotate(player.rot);
		}else if(gun.name=="unarmed"){
			if(gun.timeUp>0){
				this.ctx.fillStyle="#A87A5C";
				this.ctx.strokeStyle="#916347";
				let wiggle=Math.sin(gun.time)*gun.surrenderSize;
				this.ctx.rotate(wiggle);
				this.rect(player.size/2-1,-0.2,3.8,0.4);
				this.ctx.fillStyle="#FFFFFF";
				this.ctx.strokeStyle="#D8D8D8";
				this.rect(player.size/2+0.8,0.2,2,3.4);
				this.ctx.rotate(-wiggle);
			}
		}
	}
	mt(x,y){
		this.ctx.moveTo(x*this.cam.zoom,y*this.cam.zoom);
	}
	lt(x,y){
		this.ctx.lineTo(x*this.cam.zoom,y*this.cam.zoom);
	}
	mt2(x,y){
		this.ctx.moveTo((x-this.cam.pos.x)*this.cam.zoom,(y-this.cam.pos.y)*this.cam.zoom);
	}
	lt2(x,y){
		this.ctx.lineTo((x-this.cam.pos.x)*this.cam.zoom,(y-this.cam.pos.y)*this.cam.zoom);
	}
	start(){
		this.ctx.beginPath();
	}
	shape(){
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.stroke();
	}
	shapeOpen(){
		this.ctx.fill();
		this.ctx.stroke();
	}
	rect(x,y,w,h){
		this.ctx.fillRect(x*this.cam.zoom,y*this.cam.zoom,w*this.cam.zoom,h*this.cam.zoom);
		this.ctx.strokeRect(x*this.cam.zoom,y*this.cam.zoom,w*this.cam.zoom,h*this.cam.zoom);
	}
	rectMid(x,w,h){
		this.ctx.fillRect(x*this.cam.zoom,-h/2*this.cam.zoom,w*this.cam.zoom,h*this.cam.zoom);
		this.ctx.strokeRect(x*this.cam.zoom,-h/2*this.cam.zoom,w*this.cam.zoom,h*this.cam.zoom);
	}
	displayBullet(bullet){
		if(bullet.name=="bullet"){
			this.ctx.strokeStyle = bullet.colorDark;
			this.ctx.fillStyle = bullet.colorLight;
			this.ctx.lineWidth = 0.1*this.cam.zoom;
			this.ctx.beginPath();
			this.ctx.arc((bullet.pos.x-this.cam.pos.x)*this.cam.zoom, (bullet.pos.y-this.cam.pos.y)*this.cam.zoom, bullet.size/2*this.cam.zoom, 0, 2 * Math.PI);
			this.ctx.fill();
			this.ctx.stroke();
		}else if(bullet.name=="mine"){
			this.ctx.strokeStyle = bullet.colorDark;
			this.ctx.fillStyle = bullet.colorLight;
			this.ctx.lineWidth = 0.1*this.cam.zoom;
			let bSize=bullet.size/2;
			let bRot=bullet.ang;
			this.start();
			for(let i=0;i<12;i++){
				let vec=new Vector(bullet.pos);
				if(i%2==0){
					vec.addVec(new Vector(Math.PI/6*i+bRot,bSize,true));
				}else{
					vec.addVec(new Vector(Math.PI/6*i+bRot,bSize*0.8,true));
				}
				if(i==0){
					this.mt2(vec.x,vec.y);
				}else{
					this.lt2(vec.x,vec.y);
				}
			}
			this.shape();
		}else if(bullet.name=="heal"){
			this.ctx.strokeStyle = bullet.colorDark;
			this.ctx.fillStyle = bullet.colorLight;
			this.ctx.lineWidth = 0.1*this.cam.zoom;
			let bSize=bullet.size/2;
			let bRot=bullet.ang;
			this.start();
			for(let i=0;i<4;i++){
				let vec=new Vector(bullet.pos);
				if(i%2==0){
					vec.addVec(new Vector(Math.PI/2*i+bRot,bSize,true));
				}else{
					vec.addVec(new Vector(Math.PI/2*i+bRot,bSize*0.8,true));
				}
				if(i==0){
					this.mt2(vec.x,vec.y);
				}else{
					this.lt2(vec.x,vec.y);
				}
			}
			this.shape();
		}else if(bullet.name=="fist"){
			this.ctx.strokeStyle = bullet.colorDark;
			this.ctx.fillStyle = bullet.colorLight;
			this.ctx.lineWidth = 0.1*this.cam.zoom;
			this.fist((bullet.pos.x-this.cam.pos.x),(bullet.pos.y-this.cam.pos.y),bullet.ang,bullet.size/4);
		}
	}
	fist(offX,offY,rot,scale){
		{
			let pSize=2*scale;
			let pRot=-Math.PI/5/2-0.1+rot;
			this.start();
			for(let i=0;i<5;i++){
				let vec=new Vector(0,0);
				vec.x+=offX;
				vec.y+=offY;
				vec.addVec(new Vector(Math.PI*2/5*i+pRot,pSize,true));
				if(i==0){
					this.mt(vec.x,vec.y);
				}else{
					this.lt(vec.x,vec.y);
				}
			}
			this.shape();
		}
		{
			let fLong=1.8*scale;
			let fHigh=0.4*scale;
			let fSharp=0.3*scale;
			let fExtra=0.3*scale;
			for(let f=0;f<4;f++){
				let fAdd=1;
				if(f==1){
					fAdd=2;
				}else if(f==3){
					fAdd=0;
				}
				fAdd=fAdd*fExtra;
				let path=[new Vector(0,0),new Vector(fSharp,fHigh),new Vector(fLong+fAdd-fSharp,fHigh),
					new Vector(fLong+fAdd,0),new Vector(fLong+fAdd-fSharp,-fHigh),new Vector(fSharp,-fHigh)];
				this.start();
				let fOff=(f-1.5)*fHigh*2;
				for(let i=0;i<path.length;i++){
					let vec=new Vector(path[i]);
					vec.y+=fOff;
					vec.rotVec(rot);
					vec.x+=offX;
					vec.y+=offY;
					if(i==0){
						this.mt(vec.x,vec.y);
					}else{
						this.lt(vec.x,vec.y);
					}
				}
				this.shape();
			}
		}
		{
			let pSize=2;
			let pRot=-Math.PI/5/2-0.1;
			let tStart=new Vector(pRot+Math.PI/5*8,pSize,true);
			let path=[tStart,new Vector(tStart.x+0.8,tStart.y+0.2),new Vector(tStart.x+0.9+0.2,tStart.y+1.5),new Vector(tStart.x+0.9-0.4,tStart.y+1.8),new Vector(tStart.x,tStart.y+1)];
			this.start();
			for(let i=0;i<path.length;i++){
				let vec=new Vector(path[i]);
				vec.sclVec(scale);
				vec.rotVec(rot);
				vec.x+=offX;
				vec.y+=offY;
				if(i==0){
					this.mt(vec.x,vec.y);
				}else{
					this.lt(vec.x,vec.y);
				}
			}
			this.shapeOpen();
		}
	}
	displayMap(size,chunkSize){
		this.ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);

		let lineWeight=0.2*this.cam.zoom;
		this.ctx.lineCap="square";

		let edgeXMax=size.x;
		let edgeYMax=size.y;
		let edgeXMin=-edgeXMax;
		let edgeYMin=-edgeYMax;

		edgeXMax=(edgeXMax-this.cam.pos.x)*this.cam.zoom;
		edgeXMin=(edgeXMin-this.cam.pos.x)*this.cam.zoom;
		edgeYMax=(edgeYMax-this.cam.pos.y)*this.cam.zoom;
		edgeYMin=(edgeYMin-this.cam.pos.y)*this.cam.zoom;

		let offX1=(this.cam.pos.x%chunkSize)*this.cam.zoom;
		this.ctx.strokeStyle = "#E2D9C3";
		this.ctx.lineWidth = lineWeight;
		for(let x=-offX1;x<=this.canvasSize.x;x+=this.cam.zoom*chunkSize){
			if(x<edgeXMax+1&&x>edgeXMin-1){
				this.ctx.beginPath();
				this.ctx.moveTo(x, Math.max(0,edgeYMin));
				this.ctx.lineTo(x, Math.min(this.canvasSize.y,edgeYMax));
				this.ctx.stroke();
			}
		}
		let offX2=(this.cam.pos.x%(chunkSize*5))*this.cam.zoom;
		this.ctx.lineWidth = 2*lineWeight;
		for(let x=-offX2;x<=this.canvasSize.x;x+=this.cam.zoom*chunkSize*5){
			if(x<edgeXMax+1&&x>edgeXMin-1){
				this.ctx.beginPath();
				this.ctx.moveTo(x, Math.max(0,edgeYMin));
				this.ctx.lineTo(x, Math.min(this.canvasSize.y,edgeYMax));
				this.ctx.stroke();
			}
		}

		let offY1=(this.cam.pos.y%chunkSize)*this.cam.zoom;
		this.ctx.lineWidth = lineWeight;
		for(let y=-offY1;y<=this.canvasSize.y;y+=this.cam.zoom*chunkSize){
			if(y<edgeYMax+1&&y>edgeYMin-1){
				this.ctx.beginPath();
				this.ctx.moveTo(Math.max(0,edgeXMin), y);
				this.ctx.lineTo(Math.min(this.canvasSize.x,edgeXMax), y);
				this.ctx.stroke();
			}
		}
		let offY2=(this.cam.pos.y%(chunkSize*5))*this.cam.zoom;
		this.ctx.lineWidth = 2*lineWeight;
		for(let y=-offY2;y<=this.canvasSize.y;y+=this.cam.zoom*chunkSize*5){
			if(y<edgeYMax+1&&y>edgeYMin-1){
				this.ctx.beginPath();
				this.ctx.moveTo(Math.max(0,edgeXMin), y);
				this.ctx.lineTo(Math.min(this.canvasSize.x,edgeXMax), y);
				this.ctx.stroke();
			}
		}
		this.ctx.lineCap="butt";
	}
	displayMinimap(minimap,settings){
		let chunkSize=settings.chunkSize;
		if(minimap!=null){
			this.mapCtx.clearRect(0,0,this.mapCanvasSize.x,this.mapCanvasSize.y);
			this.mapCtx.strokeStyle = "#6D6862";
			this.mapCtx.fillStyle = "#6D6862";
			this.mapCtx.lineWidth = 2;
			let wide=minimap.length;
			let high=minimap[0].length;
			let z=Math.min((this.mapCanvasSize.y/high),(this.mapCanvasSize.x/wide));
			for(let x=0;x<minimap.length;x++){
				for(let y=0;y<minimap[x].length;y++){
					if(minimap[x][y]==1){
						this.mapCtx.strokeRect(x*z,y*z,z,z);
					}
				}
			}
			if(this.following!=null){
				let x=(this.following.pos.x/chunkSize)+wide/2;
				let y=(this.following.pos.y/chunkSize)+high/2;
				x=Math.min(Math.max(Math.floor(x),0),wide-1);
				y=Math.min(Math.max(Math.floor(y),0),high-1);
				this.mapCtx.fillRect(x*z,y*z,z,z);
				this.mapCtx.strokeRect(x*z,y*z,z,z);
			}
		}
	}
}

class PreviewDisplay extends Display{
	constructor(){
		super();
		this.canvas=document.getElementById("preview");
		this.ctx=this.canvas.getContext("2d");
		this.canvasContainer=document.getElementById("previewContainer");

		this.canvasSize=new Vector(1200,1200);
		this.updateSize();

		this.mapCanvas=null;
		this.mapCtx=null
		this.mapCanvasSize=null;
		this.following=null;
	}
	calcCam(){
		if(this.following!=null){
			this.cam.zoom = Math.max(this.canvasSize.x,this.canvasSize.y)/(10);
			this.cam.pos=new Vector(this.following.pos);
			let offset=new Vector(this.canvasSize);
			offset.sclVec(0.5);
			offset.sclVec(1/this.cam.zoom);
			this.cam.pos.subVec(offset);
		}
	}
	displayPreview(player){
		this.ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);
		this.following=player;
		this.calcCam();
		this.displayPlayer(player);
	}
	displayPlayer(player){
		if(player.transparent){
			this.ctx.globalAlpha=0.4;
		}

		this.ctx.translate((player.pos.x-this.cam.pos.x)*this.cam.zoom, (player.pos.y-this.cam.pos.y)*this.cam.zoom);
		this.ctx.rotate(player.rot);
		this.displayGun(player.weapon,player);
		this.ctx.resetTransform();

		this.ctx.strokeStyle = player.colorDark;
		this.ctx.fillStyle= player.colorLight;
		this.ctx.beginPath();
		this.ctx.arc((player.pos.x-this.cam.pos.x)*this.cam.zoom, (player.pos.y-this.cam.pos.y)*this.cam.zoom, player.size/2*this.cam.zoom, 0, 2 * Math.PI);
		this.ctx.fill();
		this.ctx.stroke();

		this.ctx.globalAlpha=1;
	}
	//previewContainer
}