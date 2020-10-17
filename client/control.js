
class Control{
	constructor(){
		this.pressedKeys = {};
		this.mousePosReal=new Vector();
		this.mouseDown = false;
		this.touchMode=false;
	}
	connect(canvas){
		window.onkeyup = (e)=>{ this.pressedKeys[e.keyCode] = false; }
		window.onkeydown = (e)=>{ this.pressedKeys[e.keyCode] = true; }

		canvas.onmousedown = ()=>{ 
			this.mouseDown=true;
			this.touchMode=false;
		}
		document.body.onmouseup = ()=>{
			this.mouseDown=false;
			this.touchMode=false;
		}
		canvas.onmousemove = (e)=>{this.trackMouse(e)};

		canvas.ontouchstart = (e)=>{this.tStart(e)};
		canvas.ontouchmove = (e)=>{this.tMove(e)};
		document.body.ontouchend = (e)=>{this.tEnd(e)};
	}
	tStart(e){
		if(e.changedTouches.length>0){
			this.mousePosReal=new Vector(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
		}
		this.mouseDown=true;
		if(!this.touchMode){
			openFullScreen();
			this.touchMode=true;
		}
	}
	tMove(e){
		if(e.changedTouches.length>0){
			this.mousePosReal=new Vector(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
		}
		this.mouseDown=true;
		if(!this.touchMode){
			openFullScreen();
			this.touchMode=true;
		}
	}
	tEnd(e){
		this.mouseDown=false;
		if(!this.touchMode){
			openFullScreen();
			this.touchMode=true;
		}
	}
	trackMouse(e){
		this.mousePosReal=new Vector(e.offsetX,e.offsetY);
	}
	getMouse(cam){
		let mPos=new Vector(this.mousePosReal);
		mPos.sclVec(1/cam.zoom);
		mPos.addVec(cam.pos);
		return mPos;
	}
}
